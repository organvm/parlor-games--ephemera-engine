import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { useAuth } from '../../../hooks/use-auth';
import { ThreeActDashboardScreen } from '../../../features/murder-mystery/screens/ThreeActDashboardScreen';
import { CharacterPacketScreen } from '../../../features/murder-mystery/screens/CharacterPacketScreen';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';
import { supabase } from '../../../lib/supabase';

export default function MurderMysteryPlay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSession, updateSession } = useSession();
  const { session: authSession } = useAuth();
  
  const [scenario, setScenario] = useState<MurderMysteryData | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to realtime updates for this session
  useEffect(() => {
    if (!id) return;

    const channel = supabase.channel(`public:sessions:id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${id}` },
        (payload) => {
          const newConfig = payload.new.config as MurderMysteryData;
          setScenario(newConfig);
          
          // Logic for players to auto-navigate based on game state
          if (newConfig?.game_night) {
            // For example, if we have a special flag for accusations started
            // This would need to be coordinated with the host's action
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (id) {
        const session = await getSession(id);
        if (session) {
          setHostId(session.host_id);
          if (session.config) {
            setScenario(session.config as MurderMysteryData);
          }
        }
      }
      setLoading(false);
    };
    fetchSessionData();
  }, [id]);

  if (loading || !authSession) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!scenario) {
    return <View style={styles.centered}><Text>Scenario not found</Text></View>;
  }

  const isHost = authSession.user.id === hostId;
  const currentCharacter = scenario.characters.find(c => c.assigned_to === authSession.user.id);

  const handleBeginAccusations = async () => {
    // The host clicks this. We can write a flag into the game_night config
    // so players' apps automatically route them to the accusation screen.
    const updatedGameNight = {
      ...scenario.game_night,
      phase: 'ACCUSATION' // Let's set a custom phase state
    };
    
    await updateSession(id as string, {
      config: {
        ...scenario,
        game_night: updatedGameNight
      } as any
    });
    
    router.push(`/murder-mystery/${id}/accusation`);
  };

  // If the host advanced the phase, redirect players automatically
  if (!isHost && scenario.game_night?.phase === 'ACCUSATION') {
    // We delay slightly to avoid render-during-render issues
    setTimeout(() => {
      router.push(`/murder-mystery/${id}/accusation`);
    }, 0);
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (isHost) {
    return (
      <View style={styles.container}>
        <ThreeActDashboardScreen
          sessionId={id as string}
          initialScenario={scenario}
          onNavigateToClues={() => console.log('Navigate to clues')}
          onNavigateToReveal={() => {
            // Update phase to EPHEMERA so players see the final report
            updateSession(id as string, {
              config: {
                ...scenario,
                game_night: { ...scenario.game_night, phase: 'EPHEMERA' }
              } as any
            }).then(() => {
              router.push(`/murder-mystery/${id}/ephemera`);
            });
          }}
          onBeginAccusations={handleBeginAccusations}
        />
      </View>
    );
  }

  // If the host advanced to Ephemera
  if (!isHost && scenario.game_night?.phase === 'EPHEMERA') {
    setTimeout(() => {
      router.push(`/murder-mystery/${id}/ephemera`);
    }, 0);
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (currentCharacter) {
    return (
      <View style={styles.container}>
        <CharacterPacketScreen
          scenario={scenario}
          characterId={currentCharacter.id}
        />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={{ color: '#fff' }}>You do not have a character assigned for this game.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  }
});
