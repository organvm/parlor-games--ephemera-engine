import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { MMKV } from 'react-native-mmkv';
import { ContentPack } from './useContentPacks';

const storage = new MMKV();
const LIBRARY_KEY = 'local_content_library';

type DownloadedPack = {
  packId: string;
  localPath: string;
  version: string;
};

export function useContentLibrary() {
  const [downloadedPacks, setDownloadedPacks] = useState<DownloadedPack[]>([]);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = storage.getString(LIBRARY_KEY);
      if (stored) {
        setDownloadedPacks(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load local library', e);
    }
  }, []);

  const downloadPack = useCallback(async (pack: ContentPack) => {
    if (!pack.content_url) return;
    
    setDownloading(prev => ({ ...prev, [pack.id]: true }));
    
    try {
      // Create local path
      const localUri = `${FileSystem.documentDirectory}packs/${pack.id}.json`;
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}packs/`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}packs/`, { intermediates: true });
      }

      // We either download from storage bucket or direct URL
      // If it's a supabase storage URL, we can use supabase download
      if (pack.content_url.startsWith('storage:')) {
        const path = pack.content_url.replace('storage:', '');
        const { data, error } = await supabase.storage.from('content-packs').download(path);
        
        if (error) throw error;
        
        // Write file
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = async () => {
          const base64Data = (fr.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(localUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
        };
      } else {
        // Direct download
        await FileSystem.downloadAsync(pack.content_url, localUri);
      }

      const newRecord = { packId: pack.id, localPath: localUri, version: pack.version };
      setDownloadedPacks(prev => {
        const filtered = prev.filter(p => p.packId !== pack.id);
        const updated = [...filtered, newRecord];
        storage.set(LIBRARY_KEY, JSON.stringify(updated));
        return updated;
      });

    } catch (e) {
      console.error('Failed to download pack', e);
    } finally {
      setDownloading(prev => ({ ...prev, [pack.id]: false }));
    }
  }, []);

  return { downloadedPacks, downloadPack, downloading };
}
