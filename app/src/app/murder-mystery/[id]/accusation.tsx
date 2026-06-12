import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { useAuth } from '../../../hooks/use-auth';
import { AccusationFormScreen } from '../../../features/murder-mystery/screens/AccusationFormScreen';
import { AwardsVotingScreen } from '../../../features/murder-mystery/screens/AwardsVotingScreen';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';
import { supabase } from '../../../lib/supabase';

export default function MurderMysteryAccusation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSession, updateSession } = useSession();
  const { session: authSession } = useAuth();
  const [scenario, setScenario] = useState<MurderMysteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'accusation' | 'voting' | 'waiting'>('accusation');

  const [hostId, setHostId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const channel = supabase.channel(`public:sessions:id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${id}` },
        (payload) => {
          const newConfig = payload.new.config as MurderMysteryData;
          setScenario(newConfig);
          
          if (newConfig?.game_night?.phase === 'EPHEMERA') {
            setTimeout(() => {
              router.push(`/murder-mystery/${id}/ephemera`);
            }, 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, router]);

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

  const currentPlayerId = authSession.user.id;
  const isHost = currentPlayerId === hostId;
  const currentPlayerCharacter = scenario.characters.find(c => c.assigned_to === currentPlayerId);

  const handleTriggerReveal = async () => {
    await updateSession(id as string, {
      config: {
        ...scenario,
        game_night: { ...scenario.game_night, phase: 'EPHEMERA' }
      } as any
    });
    router.push(`/murder-mystery/${id}/ephemera`);
  };

  if (step === 'waiting') {
    return (
      <SafeAreaView style={styles.waitingContainer}>
        <Text style={styles.waitingTitle}>Submissions Locked</Text>
        <Text style={styles.waitingText}>
          Your accusation and votes have been sealed. Please wait for the Host to begin the Reveal!
        </Text>
        {isHost && (
          <TouchableOpacity style={styles.hostButton} onPress={handleTriggerReveal}>
            <Text style={styles.hostButtonText}>The Reveal (Host Only)</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {step === 'accusation' && (
        <AccusationFormScreen
          sessionId={id as string}
          scenario={scenario}
          currentPlayerId={currentPlayerId}
          onBack={() => router.back()}
          onSubmitSuccess={() => setStep('voting')}
        />
      )}
      {step === 'voting' && (
        <AwardsVotingScreen
          sessionId={id as string}
          scenario={scenario}
          currentPlayerId={currentPlayerId}
          currentPlayerCharacterId={currentPlayerCharacter?.id}
          onBack={() => setStep('accusation')}
          onSubmitSuccess={() => setStep('waiting')}
        />
      )}
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
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fcd34d',
    marginBottom: 16,
  },
  waitingText: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
  },
  hostButton: {
    marginTop: 32,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  hostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
