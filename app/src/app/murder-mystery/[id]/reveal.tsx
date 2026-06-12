import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { RevealScreen } from '../../../features/murder-mystery/screens/RevealScreen';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

export default function MurderMysteryReveal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();

  const scenario = session?.config?.scenario as MurderMysteryData;

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

  return (
    <View style={styles.container}>
      <RevealScreen 
        scenario={scenario} 
        onBack={handleBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
