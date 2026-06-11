const fs = require('fs');
const path = require('path');

const generateItems = (prefix, count, extraFields = {}) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${(i + 1).toString().padStart(3, '0')}`,
    ...extraFields,
    text: `Sample item text for ${prefix} ${i + 1}`,
  }));
};

const packs = [
  {
    id: 'ca-classic-proust-v1',
    name: 'Classic Proust',
    game_type: 'confession-album',
    type: 'question-lineage',
    description: 'The original 35 questions from Marcel Proust\'s 1892 album.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 35,
    items: JSON.stringify(generateItems('ca-proust', 35, { type: 'question', lineage: 'classic-proust', register: 'deep', domain: 'general' }))
  },
  {
    id: 'ca-thematic-remix-v1',
    name: 'Thematic Remix',
    game_type: 'confession-album',
    type: 'question-lineage',
    description: 'A modern remix of 20 thematic questions.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 20,
    items: JSON.stringify(generateItems('ca-remix', 20, { type: 'question', lineage: 'thematic-remix', register: 'deep', domain: 'general' }))
  },
  {
    id: 'ca-vanity-fair-v1',
    name: 'Vanity Fair',
    game_type: 'confession-album',
    type: 'question-lineage',
    description: '10 questions inspired by the Vanity Fair Proust Questionnaire.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 10,
    items: JSON.stringify(generateItems('ca-vf', 10, { type: 'question', lineage: 'vanity-fair', register: 'light', domain: 'general' }))
  },
  {
    id: 'ca-pivot-lipton-v1',
    name: 'Pivot/Lipton',
    game_type: 'confession-album',
    type: 'question-lineage',
    description: '10 questions made famous by Bernard Pivot and James Lipton.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 10,
    items: JSON.stringify(generateItems('ca-pivot', 10, { type: 'question', lineage: 'pivot-lipton', register: 'light', domain: 'general' }))
  },
  {
    id: 'mm-setting-seeds-v1',
    name: 'Setting Seeds',
    game_type: 'murder-mystery',
    type: 'setting-seed',
    description: '5 foundational setting seeds for generating scenarios.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 5,
    items: JSON.stringify(generateItems('mm-seed', 5, { type: 'setting-seed' }))
  },
  {
    id: 'mm-eras-v1',
    name: 'Historical Eras',
    game_type: 'murder-mystery',
    type: 'era-packet',
    description: '10 distinct historical eras for murder mysteries.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 10,
    items: JSON.stringify(generateItems('mm-era', 10, { type: 'era' }))
  },
  {
    id: 'mm-archetypes-v1',
    name: 'Character Archetypes',
    game_type: 'murder-mystery',
    type: 'theme',
    description: '30 versatile character archetypes.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 30,
    items: JSON.stringify(generateItems('mm-arch', 30, { type: 'archetype' }))
  },
  {
    id: 'mm-crime-mechanics-v1',
    name: 'Crime Mechanics',
    game_type: 'murder-mystery',
    type: 'theme',
    description: '10 crime mechanics and murder methods.',
    author: 'Ephemera Engine',
    is_bundled: true,
    item_count: 10,
    items: JSON.stringify(generateItems('mm-mech', 10, { type: 'mechanic' }))
  }
];

let sql = `-- Seed file for bundled content packs
-- Generated automatically by script

INSERT INTO content_packs (id, name, game_type, type, description, author, is_bundled, item_count, items)
VALUES
`;

const values = packs.map(p => 
  `('${p.id}', '${p.name}', '${p.game_type}', '${p.type}', '${p.description.replace(/'/g, "''")}', '${p.author}', ${p.is_bundled}, ${p.item_count}, '${p.items.replace(/'/g, "''")}'::jsonb)`
).join(',\n');

sql += values + '\nON CONFLICT (id) DO UPDATE SET\n' +
  'name = EXCLUDED.name,\n' +
  'game_type = EXCLUDED.game_type,\n' +
  'type = EXCLUDED.type,\n' +
  'description = EXCLUDED.description,\n' +
  'is_bundled = EXCLUDED.is_bundled,\n' +
  'item_count = EXCLUDED.item_count,\n' +
  'items = EXCLUDED.items;\n';

const outPath = path.join(__dirname, 'supabase', 'seed', 'bundled-content.sql');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, sql);
console.log('Seed file generated at', outPath);
