import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export type ContentPack = {
  id: string;
  external_product_id: string;
  game_type: string;
  title: string;
  description: string;
  content_url: string;
  version: string;
  is_free: boolean;
  is_owned?: boolean;
};

export function useContentPacks(gameType?: string) {
  const { session } = useAuthStore();
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPacks() {
      setLoading(true);
      
      let query = supabase.from('content_packs').select('*').eq('is_active', true);
      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data: packsData, error } = await query;
      
      if (!error && packsData) {
        if (session?.user) {
          // Check ownership
          const { data: purchases } = await supabase
            .from('user_purchases')
            .select('pack_id')
            .eq('user_id', session.user.id);
            
          const ownedIds = new Set((purchases || []).map((p) => p.pack_id));
          
          setPacks(packsData.map(p => ({
            ...p,
            is_owned: p.is_free || ownedIds.has(p.id)
          } as ContentPack)));
        } else {
          setPacks(packsData.map(p => ({ ...p, is_owned: p.is_free } as ContentPack)));
        }
      }
      setLoading(false);
    }

    fetchPacks();
  }, [gameType, session?.user]);

  return { packs, loading };
}
