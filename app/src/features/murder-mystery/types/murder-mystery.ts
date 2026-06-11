export interface MurderMysteryData {
  setting_seed: SettingSeed;
  characters: Character[];
  crime: Crime;
  clues: Clue[];
  game_night: GameNightState;
  awards: Award[];
  sealed_envelopes: SealedEnvelope[];
}

export interface SettingSeed {
  source: 'curated' | 'generated' | 'random';
  era: string;
  location: string;
  milieu: string;
  tension: string;
  setting_description: string;
  crime_scene: string;
  generated_by: 'human' | 'llm' | 'hybrid';
  curated_seed_id?: string; // FK to content pack if curated
}

export interface Character {
  id: string;                    // e.g., "c1", "c2"
  name: string;                  // Full character name
  occupation: string;
  personality: string;           // 2–3 sentence sketch
  secret: string;                // One secret relevant to the crime — allow-secret
  relationship: {
    target_character_id: string;
    description: string;         // e.g., "You owe a great debt to the art dealer"
  };
  is_murderer: boolean;
  is_victim: boolean;
  contribution_brief: {
    food: string;                // Narratively motivated food/drink suggestion
    dress: string;               // Color palette, silhouette, accessory
    prop: string;                // One object the character would carry
  };
  preparation_prompts: string[]; // 2–3 questions
  assigned_to: string | null;    // SessionParticipation.id
}

export interface Crime {
  victim_id: string;             // FK to Character.id
  murderer_id: string;           // FK to Character.id
  weapon: string;
  motive: string;
  red_herrings: RedHerring[];
  timeline: TimelineEvent[];
}

export interface RedHerring {
  character_id: string;          // FK to Character.id
  description: string;
}

export interface TimelineEvent {
  order: number;
  description: string;
  act: 1 | 2 | 3;
}

export interface Clue {
  id: string;                    // Exhibit label: "A", "B", "C"...
  title: string;
  type: 'PHYSICAL' | 'DOCUMENT' | 'FINANCIAL' | 'PERSONAL';
  description: string;
  found_by: string;              // Character name who discovers it
  tier?: 1 | 2 | 3;             // Suggested distribution timing
}

export interface GameNightState {
  act_timestamps: ActTimestamp[];
  clues_distributed: string[];   // Clue IDs marked as distributed
  evidence_reveals: EvidenceReveal[];
  accusations: Accusation[];
}

export interface ActTimestamp {
  act: number;
  started_at: string;            // ISO 8601 timestamp
}

export interface EvidenceReveal {
  timestamp: string;
  description: string;
}

export interface Accusation {
  player_id: string;             // SessionParticipation.id
  accused_character_id: string;  // Character.id
  method: string;                // Free text: how
  motive: string;                // Free text: why
}

export interface Award {
  category: string;              // e.g., "Best Performance"
  winner_id: string;             // SessionParticipation.id
  votes: number;
}

export interface SealedEnvelope {
  character_id: string;          // Character.id
  player_id: string;             // SessionParticipation.id
  text: string;                  // Host-written epilogue
  delivered: boolean;
}
