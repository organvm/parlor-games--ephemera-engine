import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

const ScenarioReviewScreen = React.lazy(() => 
  import('../../../features/murder-mystery/screens/ScenarioReviewScreen')
    .then(module => ({ default: module.ScenarioReviewScreen }))
);

export default function MurderMysteryReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, updateSession } = useSession();

  const scenario = session?.config?.scenario as MurderMysteryData;

  if (!scenario) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Scenario...</Text>
      </View>
    );
  }

  const handleConfirm = async (confirmedScenario: MurderMysteryData) => {
    await updateSession(id as string, {
      config: { ...session?.config, scenario: confirmedScenario } as any
    });
    router.push(`/murder-mystery/${id}/characters`);
  };

  const handleRegenerate = () => {
    // Should trigger scenario regeneration, for now go back to setup
    router.back();
  };

  return (
    <View style={styles.container}>
      <React.Suspense fallback={
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading Review...</Text>
        </View>
      }>
        <ScenarioReviewScreen 
          scenario={scenario} 
          onConfirm={handleConfirm} 
          onRegenerate={handleRegenerate} 
        />
      </React.Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
