import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'question_items',
          columns: [
            { name: 'text', type: 'string' },
            { name: 'lineage', type: 'string' },
            { name: 'register', type: 'string' },
            { name: 'domain', type: 'string' },
            { name: 'is_active', type: 'boolean' },
          ],
        }),
        createTable({
          name: 'chain_entries',
          columns: [
            { name: 'question_id', type: 'string', isIndexed: true },
            { name: 'player_id', type: 'string' },
            { name: 'session_id', type: 'string', isIndexed: true },
            { name: 'turn_number', type: 'number', isIndexed: true },
            { name: 'answer_text', type: 'string' },
            { name: 'timestamp', type: 'number' },
          ],
        }),
        createTable({
          name: 'return_entries',
          columns: [
            { name: 'original_answer_id', type: 'string' },
            { name: 'player_id', type: 'string' },
            { name: 'session_id', type: 'string', isIndexed: true },
            { name: 'reflection_text', type: 'string' },
          ],
        }),
        createTable({
          name: 'contribution_items',
          columns: [
            { name: 'player_id', type: 'string' },
            { name: 'session_id', type: 'string', isIndexed: true },
            { name: 'archetype', type: 'string' },
            { name: 'item_data', type: 'string' },
          ],
        }),
      ],
    },
  ],
});
