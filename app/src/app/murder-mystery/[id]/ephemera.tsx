import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { useAuth } from '../../../hooks/use-auth';
import { FinalReportScreen } from '../../../features/murder-mystery/screens/FinalReportScreen';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

export default function MurderMysteryEphemera() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSession } = useSession();
  const { session: authSession } = useAuth();
  
  const [scenario, setScenario] = useState<MurderMysteryData | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
      <FinalReportScreen 
        scenario={scenario} 
        isHost={isHost}
        onExit={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  }
});
