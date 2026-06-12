import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// Nunjucks and PDF generation would go here in a real implementation.
// For the scope of this project, we mock the rendering and return a success payload.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId, artifactPayload } = await req.json();

    if (!sessionId || !artifactPayload) {
      throw new Error('Missing sessionId or artifactPayload');
    }

    const { artifact_type } = artifactPayload;
    if (!['mm_dossier', 'mm_menu', 'mm_sealed_envelope'].includes(artifact_type)) {
      throw new Error('Unsupported artifact type');
    }

    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock PDF generation and storage upload
    const mockPdfPath = `artifacts/${sessionId}/${artifact_type}_mock.pdf`;
    const mockPdfData = new Uint8Array([0, 1, 2, 3]); // Dummy binary data
    
    const { error: uploadError } = await supabase.storage
      .from('ephemera')
      .upload(mockPdfPath, mockPdfData, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Process specific artifact types
    if (artifact_type === 'mm_dossier') {
      const data = artifactPayload.data;
      console.log(`Generated dossier for ${data.title} with outcome: ${data.outcome.murderer} murdered ${data.outcome.victim}`);
    }

    // Distribute artifact (T045: Implement artifact distribution)
    // Fetch participants for this session to distribute the artifact to
    const { data: participants, error: pError } = await supabase
      .from('session_participations')
      .select('user_id')
      .eq('session_id', sessionId);

    if (pError) {
      console.error('Failed to fetch participants for distribution', pError);
    } else if (participants && participants.length > 0) {
      const { data: publicUrlData } = supabase.storage.from('ephemera').getPublicUrl(mockPdfPath);
      
      const notifications = participants.map((p: any) => ({
        user_id: p.user_id,
        type: 'ARTIFACT_DELIVERY',
        title: `New Artifact: ${artifact_type}`,
        body: `Your post-game artifact is ready to view.`,
        data: { session_id: sessionId, artifact_type, url: publicUrlData.publicUrl },
        status: 'PENDING'
      }));

      await supabase.from('notification_queue').insert(notifications);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      artifact_type,
      path: mockPdfPath 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
