import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from './setup';

describe('Bundled Content Seeding', () => {
  it('should have all 8 bundled content packs', async () => {
    const { data, error } = await testClient
      .from('content_packs')
      .select('id, name, item_count, is_bundled')
      .eq('is_bundled', true);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Check total bundles (we should have at least the ones seeded)
    const seededIds = [
      'ca-classic-proust-v1',
      'ca-thematic-remix-v1',
      'ca-vanity-fair-v1',
      'ca-pivot-lipton-v1',
      'mm-setting-seeds-v1',
      'mm-eras-v1',
      'mm-archetypes-v1',
      'mm-crime-mechanics-v1'
    ];
    
    // We expect the count to be correct
    expect(data?.length).toBeGreaterThanOrEqual(seededIds.length);
    
    const bundledItemsMap = new Map(data?.map(p => [p.id, p]));
    
    for (const id of seededIds) {
      expect(bundledItemsMap.has(id)).toBe(true);
    }

    // Verify item counts
    expect(bundledItemsMap.get('ca-classic-proust-v1')?.item_count).toBe(35);
    expect(bundledItemsMap.get('ca-thematic-remix-v1')?.item_count).toBe(20);
    expect(bundledItemsMap.get('ca-vanity-fair-v1')?.item_count).toBe(10);
    expect(bundledItemsMap.get('ca-pivot-lipton-v1')?.item_count).toBe(10);
    expect(bundledItemsMap.get('mm-setting-seeds-v1')?.item_count).toBe(5);
    expect(bundledItemsMap.get('mm-eras-v1')?.item_count).toBe(10);
    expect(bundledItemsMap.get('mm-archetypes-v1')?.item_count).toBe(30);
    expect(bundledItemsMap.get('mm-crime-mechanics-v1')?.item_count).toBe(10);
  });

  it('items array length matches item_count', async () => {
    const { data, error } = await testClient
      .from('content_packs')
      .select('id, item_count, items')
      .eq('is_bundled', true);

    expect(error).toBeNull();
    
    for (const pack of data || []) {
      expect(pack.items).toBeDefined();
      expect(pack.items.length).toBe(pack.item_count);
    }
  });
});
