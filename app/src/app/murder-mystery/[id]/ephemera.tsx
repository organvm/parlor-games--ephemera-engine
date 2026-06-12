import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { EphemeraEngineVisualizer } from '../../../features/murder-mystery/screens/EphemeraEngineVisualizer';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

export default function MurderMysteryEphemera() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSession } = useSession();
  const [scenario, setScenario] = useState<MurderMysteryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (id) {
        const session = await getSession(id);
        if (session && session.config) {
          setScenario(session.config as MurderMysteryData);
        }
      }
      setLoading(false);
    };
    fetchSessionData();
  }, [id]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!scenario) {
    return <View style={styles.centered}><Text>Scenario not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <EphemeraEngineVisualizer scenario={scenario} />
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
