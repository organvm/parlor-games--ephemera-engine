import { MurderMysteryData } from '../types/murder-mystery';

export const fallbackCuratedSeed: MurderMysteryData = {
  setting_seed: {
    source: 'curated',
    era: '1920s',
    location: 'A remote manor house in the English countryside',
    milieu: 'High society gathering',
    tension: 'A terrible storm has trapped everyone inside',
    setting_description: 'The wind howls against the stained-glass windows of Blackwood Manor. A grand chandelier flickers ominously in the main hall. The bridge to the mainland washed out an hour ago, leaving the guests stranded with a killer.',
    crime_scene: 'The Library, near the fireplace',
    generated_by: 'human',
    curated_seed_id: 'fallback-manor-01'
  },
  characters: [
    {
      id: 'c1',
      name: 'Lord Reginald Blackwood',
      occupation: 'Wealthy Aristocrat',
      personality: 'Pompous and demanding. He expects everything to go exactly his way.',
      secret: 'He is completely bankrupt and was planning to sell the estate to pay off gambling debts.',
      relationship: {
        target_character_id: 'c2',
        description: 'You are deeply jealous of your younger brother.'
      },
      is_murderer: false,
      is_victim: true,
      contribution_brief: { food: 'A very expensive bottle of vintage port.', dress: 'A tuxedo that is slightly out of fashion.', prop: 'A gold pocket watch.' },
      preparation_prompts: ['How do you treat those you consider beneath you?'],
      assigned_to: null
    },
    {
      id: 'c2',
      name: 'Arthur Blackwood',
      occupation: 'Failed Businessman',
      personality: 'Nervous and resentful. He feels he has never been given a fair chance.',
      secret: 'He stole money from the family trust to fund a failed venture in the colonies.',
      relationship: {
        target_character_id: 'c1',
        description: 'You desperately need your brother to bail you out one last time.'
      },
      is_murderer: true,
      is_victim: false,
      contribution_brief: { food: 'Store-bought biscuits disguised in a nice tin.', dress: 'A suit with slightly frayed cuffs.', prop: 'A silver flask.' },
      preparation_prompts: ['What are you willing to do to keep your failures a secret?'],
      assigned_to: null
    },
    {
      id: 'c3',
      name: 'Lady Eleanor Blackwood',
      occupation: 'Socialite',
      personality: 'Cold, calculating, and exceptionally poised.',
      secret: 'She has been having an affair with the groundskeeper.',
      relationship: {
        target_character_id: 'c1',
        description: 'Your marriage is entirely a sham maintained for appearances.'
      },
      is_murderer: false,
      is_victim: false,
      contribution_brief: { food: 'Delicate cucumber sandwiches.', dress: 'An elegant but conservative evening gown.', prop: 'A long cigarette holder.' },
      preparation_prompts: ['How do you deflect uncomfortable questions?'],
      assigned_to: null
    },
    {
      id: 'c4',
      name: 'Dr. Thomas Sterling',
      occupation: 'Private Physician',
      personality: 'Overly analytical and dismissive of emotional displays.',
      secret: 'He has been prescribing Lord Blackwood experimental and highly dangerous medication.',
      relationship: {
        target_character_id: 'c3',
        description: 'You know a secret about Lady Eleanor\'s past health.'
      },
      is_murderer: false,
      is_victim: false,
      contribution_brief: { food: 'A selection of sharp cheeses.', dress: 'A very neat, dark suit.', prop: 'A small leather medical bag.' },
      preparation_prompts: ['How do you react when your expertise is questioned?'],
      assigned_to: null
    }
  ],
  crime: {
    victim_id: 'c1',
    murderer_id: 'c2',
    weapon: 'A heavy brass candlestick from the library',
    motive: 'Arthur (c2) asked Lord Blackwood for money to cover his stolen funds, but Lord Blackwood refused and threatened to expose Arthur. In a panic, Arthur struck him.',
    red_herrings: [
      { character_id: 'c3', description: 'Lady Eleanor was seen slipping out of the library shortly before the body was found, but she was merely meeting her lover.' },
      { character_id: 'c4', description: 'Dr. Sterling\'s medical bag was found open near the body, but he had merely dropped it in shock when discovering the scene.' }
    ],
    timeline: [
      { order: 1, description: 'The guests arrive for the weekend party and gather in the drawing room.', act: 1 },
      { order: 2, description: 'Lord Blackwood retires to the library to read after a heated argument with Arthur.', act: 2 },
      { order: 3, description: 'A scream is heard, and the body is discovered in the library.', act: 3 }
    ]
  },
  clues: [
    { id: 'clue-1', title: 'The Torn Ledger', type: 'DOCUMENT', description: 'A page from the estate ledger showing massive gambling debts. It is half-burnt in the fireplace.', found_by: 'Dr. Sterling', tier: 1 },
    { id: 'clue-2', title: 'A Threatening Letter', type: 'DOCUMENT', description: 'A letter demanding immediate repayment of trust funds, addressed to Arthur.', found_by: 'Lady Eleanor', tier: 2 },
    { id: 'clue-3', title: 'Muddy Footprints', type: 'PHYSICAL', description: 'Muddy footprints leading from the garden to the library window.', found_by: 'Arthur Blackwood', tier: 1 }
  ],
  game_night: {
    act_timestamps: [],
    clues_distributed: [],
    evidence_reveals: [],
    accusations: []
  },
  awards: [],
  sealed_envelopes: []
};

export const getCuratedSeed = (playerCount: number): MurderMysteryData => {
  // Return the generic curated seed as an instant fallback
  return fallbackCuratedSeed;
};
