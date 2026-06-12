import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Mock generation endpoint
  return new Response(JSON.stringify({ status: "success", artifact_id: "mock_123" }), {
    headers: { "Content-Type": "application/json" },
  });
});
