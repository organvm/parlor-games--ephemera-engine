import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") || "", // allow-secret
});

const SYSTEM_PROMPT = `You are a master mystery writer who designs highly engaging, coherent, and consistent Murder Mystery party game scenarios. 
You will be provided with four setting axes (Era, Location, Milieu, Tension) and a player_count.
Your task is to generate a complete murder mystery scenario including the setting, characters, crime, red herrings, clues, and timeline.
Your response MUST be a valid JSON object adhering exactly to the following structure:

{
  "setting_seed": {
    "source": "generated",
    "era": "string",
    "location": "string",
    "milieu": "string",
    "tension": "string",
    "setting_description": "string (atmospheric description of the setting)",
    "crime_scene": "string (where the body was found)",
    "generated_by": "llm"
  },
  "characters": [
    {
      "id": "c1", // up to cN based on player_count
      "name": "string",
      "occupation": "string",
      "personality": "string (2-3 sentences)",
      "secret": "string (relevant to the crime or setting)",
      "relationship": {
        "target_character_id": "string",
        "description": "string"
      },
      "is_murderer": boolean, // exactly one must be true
      "is_victim": boolean, // exactly one must be true
      "contribution_brief": {
        "food": "string",
        "dress": "string",
        "prop": "string"
      },
      "preparation_prompts": ["string", "string"] // 2-3 questions for the player to think about
    }
  ],
  "crime": {
    "victim_id": "string",
    "murderer_id": "string",
    "weapon": "string",
    "motive": "string",
    "red_herrings": [
      {
        "character_id": "string",
        "description": "string (something suspicious they did that looks like murder but isn't)"
      }
    ],
    "timeline": [
      { "order": 1, "description": "string", "act": 1 },
      { "order": 2, "description": "string", "act": 2 },
      { "order": 3, "description": "string", "act": 3 }
    ]
  },
  "clues": [
    {
      "id": "clue-1",
      "title": "string",
      "type": "PHYSICAL" | "DOCUMENT" | "FINANCIAL" | "PERSONAL",
      "description": "string",
      "found_by": "string (character name)",
      "tier": 1 // 1, 2, or 3
    }
  ]
}

CONSISTENCY RULES:
1. "characters" array length MUST exactly equal the requested player_count + 1 (the extra character is the victim, who is an NPC or played briefly). Wait, standard murder mysteries usually have the victim as one of the players, but often the victim dies early or is an NPC. Let's make exactly player_count characters, and one of them is the murderer. The victim should be an additional NPC, or included in the characters list but marked is_victim. Make the characters array length equal to player_count. The victim is NOT one of the player characters (they are dead). Actually, let's include the victim in the characters array so they have a profile, but they won't be assigned to a living player. So length = player_count + 1. 
2. EXACTLY ONE character must have is_murderer = true.
3. EXACTLY ONE character must have is_victim = true. The murderer and victim CANNOT be the same person.
4. All IDs used in relationships, red_herrings, and crime MUST match an ID in the characters array.
5. Timeline MUST have at least 3 events, ordered logically.
6. Provide at least 5 clues.
`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { era, location, milieu, tension, session_id, player_count = 8 } = await req.json();

    if (!era || !location || !session_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Rate limiting: Check if more than 10 generations in this session
    const { count, error: countError } = await supabase
      .from('seed_generation_log')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);
      
    if (countError) throw countError;
    if (count !== null && count >= 10) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded for this session (max 10)." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Call Anthropic API
    const userPrompt = `Generate a murder mystery with the following parameters:
Era: ${era}
Location: ${location}
Milieu: ${milieu || 'Any'}
Tension: ${tension || 'Any'}
Player Count: ${player_count} (meaning ${player_count} living suspects + 1 victim)`;

    let attempt = 0;
    let generatedScenario = null;
    let lastError = null;

    while (attempt < 3 && !generatedScenario) {
      attempt++;
      try {
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          temperature: 0.7,
          system: SYSTEM_PROMPT,
          messages: [
            { role: "user", content: userPrompt }
          ]
        });

        const content = message.content[0].type === 'text' ? message.content[0].text : '';
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("No JSON object found in response");
        }

        const jsonString = content.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonString);

        // Basic validation
        if (!parsed.characters || !Array.isArray(parsed.characters)) throw new Error("Missing characters array");
        if (!parsed.crime) throw new Error("Missing crime object");
        
        const victims = parsed.characters.filter((c: any) => c.is_victim);
        const murderers = parsed.characters.filter((c: any) => c.is_murderer);
        
        if (victims.length !== 1) throw new Error(`Expected exactly 1 victim, got ${victims.length}`);
        if (murderers.length !== 1) throw new Error(`Expected exactly 1 murderer, got ${murderers.length}`);
        if (victims[0].id === murderers[0].id) throw new Error("Victim and murderer cannot be the same");

        generatedScenario = parsed;
      } catch (err: any) {
        lastError = err.message;
        console.error(`Attempt ${attempt} failed:`, err);
      }
    }

    if (!generatedScenario) {
      return new Response(JSON.stringify({ error: "Failed to generate valid scenario", details: lastError }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Log the generation
    await supabase.from('seed_generation_log').insert({
      session_id,
      prompt_params: { era, location, milieu, tension, player_count },
      generated_seed: generatedScenario,
      status: 'success'
    });

    return new Response(JSON.stringify({ scenario: generatedScenario }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
