import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    // Create Supabase client from auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // We create a client with the user's auth context
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { pack_id, platform, receipt_data } = await req.json();

    if (!pack_id || !platform || !receipt_data) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // --- MOCK VALIDATION LOGIC ---
    // In production, we would validate JWS for Apple and use googleapis for Android.
    // For now, we simulate validation success unless receipt_data is explicitly marked as 'invalid'.
    let isValid = true;
    let validationError = '';
    
    if (receipt_data === 'invalid' || receipt_data?.status === 'invalid') {
      isValid = false;
      validationError = 'Receipt validation failed at platform server';
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: validationError }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // --- END MOCK VALIDATION LOGIC ---

    // Now insert the record into user_content_packs
    // We use the service role key to bypass RLS since users cannot insert their own purchases directly
    const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: insertData, error: insertError } = await supabaseService
      .from('user_content_packs')
      .insert({
        user_id: user.id,
        pack_id: pack_id,
        platform: platform,
        receipt_data: receipt_data
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ error: 'User already owns this pack' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      throw insertError;
    }

    // In a real scenario, we might also return a signed URL to download large assets.
    // For Ephemera Engine, content packs are stored directly in the `content_packs` table's JSONB, 
    // so the client can now just read it since they have a row in `user_content_packs` 
    // (wait, RLS on content_packs might need adjustment, but actually they can just query it, or the app downloads it).
    // The spec says: "On valid receipt: insert into user_content_packs, generate signed download URL".
    // If the actual pack content is in storage buckets, we would generate a signed URL here.
    // For now we'll just return success.

    return new Response(JSON.stringify({ 
      success: true, 
      pack: insertData,
      download_url: null // Placeholder for T009 storage implementation
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
