# Research: 006 Artifact Generation Pipeline

Technology research for server-side PDF generation, storage, delivery, scheduling, and in-app viewing.

---

## 1. Puppeteer Server-Side Deployment

### 1.1 Google Cloud Run (Recommended)

**What**: Serverless container platform. Runs Docker containers that scale to zero.

**Why it fits**:
- Native support for Puppeteer via official `ghcr.io/puppeteer/puppeteer` Docker image
- Scales to zero when no generation requests are pending (cost-efficient for bursty post-game workloads)
- Configurable memory (512MB-4GB) and CPU allocation per instance
- Cold start: 2-5 seconds (acceptable for non-real-time post-game generation)
- Max request timeout: 60 minutes (more than enough for 30-second generation)
- Direct GCP networking if other GCP services are used

**Configuration for Puppeteer**:
```yaml
# Cloud Run service configuration
memory: 1Gi          # Puppeteer needs ~512MB-1GB for Chrome
cpu: 1               # Single CPU sufficient for sequential rendering
maxInstances: 5      # Limit concurrent generation
minInstances: 0      # Scale to zero
timeout: 120s        # 2 minutes max per request
concurrency: 1       # One generation per instance (Puppeteer is not thread-safe)
```

**Cost estimate** (100 sessions/week, ~3 artifacts per session):
- ~300 invocations/week, ~30 seconds each = ~150 CPU-minutes/week
- Cloud Run free tier: 180,000 vCPU-seconds/month = ~3000 CPU-minutes
- Likely within free tier for V1 launch

**Docker base image**:
```dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest
# OR
FROM node:22-slim
RUN apt-get update && apt-get install -y chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

**Risks**:
- Cold start latency (mitigated by min-instances=1 if needed, at ~$10/month)
- Chrome memory spikes on large PDFs (mitigated by page streaming and memory limit)

### 1.2 Browserless.io (Alternative)

**What**: Managed headless Chrome API. Send HTML, receive PDF.

**Why considered**: No infrastructure to manage. Simple REST API.

**Why rejected**:
- External dependency for a core feature
- Usage-based pricing ($0.01-0.10 per page render) adds up
- Network latency: must upload HTML + CSS + fonts, receive PDF, then upload to our storage
- Less control over Chrome flags and rendering behavior
- Vendor lock-in risk

### 1.3 Railway / Render (Alternative)

**What**: Container hosting platforms with always-on or auto-scaling options.

**Why rejected**:
- Railway: no scale-to-zero on free tier, $5/month minimum
- Render: free tier containers spin down after 15 minutes of inactivity, 30-second cold start
- Neither offers the tight GCP integration of Cloud Run
- Cloud Run's concurrency model (1 request per instance) better matches Puppeteer's single-threaded nature

### 1.4 AWS Lambda + Chrome Layer (Alternative)

**What**: Serverless function with Chromium bundled as a Lambda Layer.

**Why rejected**:
- Lambda has a 6MB deployment package limit (Chromium is ~130MB), requiring a Layer
- `@sparticuz/chromium` package provides a Lambda-compatible Chromium but is a complex dependency
- 15-minute timeout is fine, but cold start with Chrome layer is 5-10 seconds
- Adds AWS as a dependency alongside Supabase (GCP ecosystem)
- More complex to debug and test locally

---

## 2. Supabase Storage for PDFs

### 2.1 Architecture

Supabase Storage is built on top of S3-compatible object storage with a PostgreSQL metadata layer. It provides:

- **Buckets**: Logical groupings of files (one bucket per artifact type or one shared bucket)
- **Row Level Security (RLS)**: Policies can restrict access based on the authenticated user
- **CDN**: Files served via a global CDN with caching
- **Presigned URLs**: Time-limited download URLs (1 hour to 7 days)
- **Transformations**: Image resizing (not applicable to PDFs)

### 2.2 Recommended Bucket Structure

```
artifacts/
├── {session_id}/
│   ├── the-album.pdf
│   ├── contributions-table.pdf
│   ├── the-dossier.pdf
│   ├── menu-of-the-damned.pdf
│   └── prousts-answer/
│       ├── {participant_id}.pdf
│       └── ...
```

Single `artifacts` bucket with session-scoped paths. RLS policies ensure only session participants can access files.

### 2.3 Upload from Cloud Run

The Cloud Run service uploads directly to Supabase Storage using the Supabase JS SDK with a service role key:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.storage
  .from('artifacts')
  .upload(`${sessionId}/${templateName}.pdf`, pdfBuffer, {
    contentType: 'application/pdf',
    cacheControl: '3600',
  });
```

### 2.4 Download URL Generation

For app players: direct URL via CDN (authenticated via Supabase session).
For web players: presigned URL with 30-day expiry.

```typescript
const { data } = await supabase.storage
  .from('artifacts')
  .createSignedUrl(`${sessionId}/${templateName}.pdf`, 60 * 60 * 24 * 30); // 30 days
```

### 2.5 Storage Limits and Costs

- Supabase Pro plan: 100GB storage included, $0.021/GB/month beyond
- Estimated per artifact: 200KB-2MB (average ~500KB based on fixture renders)
- 100 sessions/week * 3 artifacts * 500KB = ~150MB/week, ~600MB/month
- Well within free/pro tier limits

---

## 3. Email Delivery Services

### 3.1 Resend (Recommended)

**What**: Developer-first email API built on Amazon SES. Founded by the creator of react-email.

**Why it fits**:
- Modern API, excellent TypeScript SDK
- react-email integration for beautiful HTML emails that match our design language
- Transactional email focus (not marketing)
- 3,000 free emails/month, then $20/month for 50,000
- Supports attachments (PDF up to 40MB) and inline images
- Delivery tracking: sent, delivered, opened, bounced
- Simple integration:

```typescript
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

await resend.emails.send({
  from: 'Ephemera Engine <artifacts@ephemera.engine>',
  to: player.email,
  subject: `Your Album from "${session.title}" is ready`,
  html: emailTemplate,
  attachments: [{
    filename: 'the-album.pdf',
    content: pdfBuffer, // or URL
  }],
});
```

### 3.2 SendGrid (Alternative)

**Why considered**: Industry standard, 100 free emails/day.
**Why rejected**: More complex API, heavier SDK, marketing-focused features we do not need.

### 3.3 Postmark (Alternative)

**Why considered**: Best deliverability reputation for transactional email.
**Why rejected**: More expensive ($15/month for 10,000 emails), less developer-ergonomic than Resend.

---

## 4. Scheduled Job Options for Delayed Delivery

### 4.1 Inngest (Recommended)

**What**: Event-driven, durable workflow engine with cron scheduling and step functions.

**Why it fits**:
- Declarative scheduling: `inngest.send({ name: 'artifact/deliver', data: { artifactId }, ts: scheduledAt })`
- Automatic retries with configurable backoff
- Step functions for multi-step workflows (generate -> upload -> notify)
- Durable execution: if a step fails, it resumes from the last successful step
- Dashboard for monitoring scheduled jobs
- Free tier: 25,000 function runs/month
- TypeScript SDK, works with any hosting provider

**Delayed delivery workflow**:
```typescript
inngest.createFunction(
  { id: 'deliver-delayed-artifact' },
  { event: 'artifact/deliver-delayed' },
  async ({ event, step }) => {
    // Step 1: Generate the personalized artifact
    const artifact = await step.run('generate', async () => {
      return await generatePersonalizedArtifact(event.data);
    });

    // Step 2: Upload to storage
    const url = await step.run('upload', async () => {
      return await uploadToStorage(artifact);
    });

    // Step 3: Send notification
    await step.run('notify', async () => {
      await sendDeliveryNotification(event.data.participantId, url);
    });
  }
);
```

### 4.2 pg_cron (Alternative)

**What**: PostgreSQL extension for scheduling periodic jobs. Available on Supabase.

**Why considered**: No external service needed. Runs inside Supabase's PostgreSQL.
**Why rejected for primary scheduler**:
- pg_cron runs SQL, not application logic. Would need to call an Edge Function via `net.http_post`.
- Minimum granularity: 1 minute. Fine for delivery, but less flexible.
- No built-in retry logic or step functions.
- Harder to debug and monitor than Inngest dashboard.

**Acceptable as fallback**: pg_cron can trigger a nightly "process delivery queue" function as a safety net.

### 4.3 Simple Database Queue + Polling (Simplest Alternative)

**What**: Store scheduled deliveries in a `delivery_queue` table, poll every 5 minutes via pg_cron or a cron Cloud Run job.

**Why to consider**: No external dependencies. Uses only Supabase PostgreSQL.

**Pattern**:
```sql
-- pg_cron: every 5 minutes
SELECT cron.schedule('process-delivery-queue', '*/5 * * * *',
  $$ SELECT net.http_post('https://your-edge-function.supabase.co/process-queue') $$
);
```

**Trade-off**: Less sophisticated than Inngest (no step functions, manual retry logic) but zero external dependencies. If the Simplicity Gate is a concern, this is the right choice.

**Recommendation**: Start with the database queue + pg_cron approach (simplest). Migrate to Inngest only if retry/observability needs exceed what pg_cron provides.

---

## 5. In-App PDF Viewing

### 5.1 react-native-pdf (Recommended)

**What**: React Native component for displaying PDFs. Wraps platform-native PDF renderers (PDFKit on iOS, PdfRenderer on Android).

**Key features**:
- Scroll and page navigation
- Pinch-to-zoom
- Page count, current page callbacks
- Source from URL, file path, or base64
- Horizontal and vertical scroll modes
- Performance: native rendering, not WebView-based

**Integration**:
```typescript
import Pdf from 'react-native-pdf';

<Pdf
  source={{ uri: artifact.fileUrl, cache: true }}
  onLoadComplete={(numberOfPages) => setPageCount(numberOfPages)}
  onError={(error) => handleError(error)}
  style={{ flex: 1 }}
/>
```

**Expo compatibility**: Works with Expo development builds (not Expo Go due to native module). Requires `expo-dev-client`.

### 5.2 expo-web-browser (Alternative for Web Players)

For web player artifact viewing, open the PDF URL in the system browser. No in-app viewer needed for web players.

### 5.3 react-native-blob-util + Share (For Downloads)

```typescript
import ReactNativeBlobUtil from 'react-native-blob-util';

const res = await ReactNativeBlobUtil.config({
  fileCache: true,
  appendExt: 'pdf',
}).fetch('GET', artifact.fileUrl);

await Share.open({ url: `file://${res.path()}`, type: 'application/pdf' });
```

---

## 6. Push Notification Delivery

### 6.1 Expo Notifications

Already in the tech stack (PRD 5.1). Expo Notifications provides:
- Cross-platform push (APNs for iOS, FCM for Android)
- Server-side sending via Expo Push API
- Token management
- Delivery receipts (success, error, DeviceNotRegistered)

**Artifact delivery notification**:
```typescript
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: player.expoPushToken,
    title: `Your ${artifact.name} is ready`,
    body: `Open to view your keepsake from "${session.title}"`,
    data: { screen: 'ArtifactPreview', artifactId: artifact.id },
  }),
});
```

---

## 7. Summary of Recommendations

| Concern | Recommendation | Rationale |
|---------|---------------|-----------|
| Puppeteer hosting | Google Cloud Run | Scale-to-zero, native Docker support, within free tier |
| PDF storage | Supabase Storage | Single platform, RLS, CDN, presigned URLs |
| Email delivery | Resend | Modern API, TypeScript-first, react-email templates, attachment support |
| Scheduled delivery | pg_cron + database queue (V1), Inngest (V2 if needed) | Simplicity Gate compliance; no external dependencies in V1 |
| PDF viewing | react-native-pdf | Native rendering, Expo-compatible, pinch-to-zoom |
| Push notifications | Expo Notifications | Already in stack, cross-platform, delivery receipts |
