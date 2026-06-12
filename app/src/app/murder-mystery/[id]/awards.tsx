import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { AwardsVotingScreen } from '../../../features/murder-mystery/screens/AwardsVotingScreen';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

export default function MurderMysteryAwards() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();

  const scenario = session?.config?.scenario as MurderMysteryData;

  // For host view or testing, assume a current player id
  // In a real flow, this would come from the auth context or player session
  const currentPlayerId = "host-player-id";

  if (!scenario) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleSubmitSuccess = () => {
    router.push(`/murder-mystery/${id}/epilogue`);
  };

  return (
    <View style={styles.container}>
      <AwardsVotingScreen 
        sessionId={id as string}
        scenario={scenario} 
        currentPlayerId={currentPlayerId}
        onBack={handleBack}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
