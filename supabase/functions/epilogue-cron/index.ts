import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Host writing prompt notification (T054) - 2 days after completion
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data: needsWritingPrompt } = await supabase
      .from('sessions')
      .select('id, host_id, ended_at')
      .eq('status', 'COMPLETED')
      .lte('ended_at', twoDaysAgo.toISOString())
      .eq('epilogues_status', 'PENDING');

    if (needsWritingPrompt && needsWritingPrompt.length > 0) {
      const notifications = needsWritingPrompt.map(s => ({
        user_id: s.host_id,
        type: 'EPILOGUE_PROMPT',
        title: 'Time to write epilogues',
        body: 'The dust has settled. What happened to everyone after the reveal?',
        data: { session_id: s.id },
        status: 'PENDING'
      }));
      await supabase.from('notification_queue').insert(notifications);
      
      // Mark as PROMPTED to avoid duplicate notifications
      for (const s of needsWritingPrompt) {
        await supabase.from('sessions').update({ epilogues_status: 'PROMPTED' }).eq('id', s.id);
      }
    }

    // 2. Weekly reminder flow (T055) - every 7 days if still PROMPTED
    const nineDaysAgo = new Date();
    nineDaysAgo.setDate(nineDaysAgo.getDate() - 9); // 2 days + 7 days
    
    const { data: needsReminder } = await supabase
      .from('sessions')
      .select('id, host_id, ended_at')
      .eq('status', 'COMPLETED')
      .lte('ended_at', nineDaysAgo.toISOString())
      .eq('epilogues_status', 'PROMPTED');

    if (needsReminder && needsReminder.length > 0) {
      const notifications = needsReminder.map(s => ({
        user_id: s.host_id,
        type: 'EPILOGUE_REMINDER',
        title: 'Your guests are waiting',
        body: 'Don\'t leave them hanging! Write the final epilogues.',
        data: { session_id: s.id },
        status: 'PENDING'
      }));
      await supabase.from('notification_queue').insert(notifications);
    }

    // 3. Scheduled delivery (T053) - Deliver written epilogues after schedule date
    const today = new Date().toISOString();
    const { data: readyToDeliver } = await supabase
      .from('sessions')
      .select('id, host_id')
      .eq('status', 'COMPLETED')
      .eq('epilogues_status', 'WRITTEN')
      .lte('epilogue_delivery_date', today);

    if (readyToDeliver && readyToDeliver.length > 0) {
      for (const s of readyToDeliver) {
        // Find participants
        const { data: participants } = await supabase
          .from('session_participations')
          .select('user_id')
          .eq('session_id', s.id);
          
        if (participants) {
          const notifications = participants.map(p => ({
            user_id: p.user_id,
            type: 'ARTIFACT_DELIVERY',
            title: 'A sealed envelope, addressed to you.',
            body: 'Your character\'s epilogue has arrived.',
            data: { session_id: s.id, artifact_type: 'mm_sealed_envelope' },
            status: 'PENDING'
          }));
          await supabase.from('notification_queue').insert(notifications);
        }
        
        // Mark as DELIVERED
        await supabase.from('sessions').update({ epilogues_status: 'DELIVERED' }).eq('id', s.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
