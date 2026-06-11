import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { resolveInvitationToken, TokenResolution } from '../services/deeplink.service';

export function useDeepLink() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [resolution, setResolution] = useState<TokenResolution | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function resolveToken() {
      if (!token) return;
      setLoading(true);
      const res = await resolveInvitationToken(token);
      setResolution(res);
      setLoading(false);
    }
    resolveToken();
  }, [token]);

  return { token, resolution, loading };
}
