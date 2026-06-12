import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { MurderMysteryData } from '../../../features/murder-mystery/types/murder-mystery';

const EpilogueWritingScreen = React.lazy(() => 
  import('../../../features/murder-mystery/screens/EpilogueWritingScreen')
    .then(module => ({ default: module.EpilogueWritingScreen }))
);

export default function MurderMysteryEpilogue() {
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
      <React.Suspense fallback={
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading Epilogue Editor...</Text>
        </View>
      }>
        <EpilogueWritingScreen 
          sessionId={id as string}
          scenario={scenario} 
          onBack={handleBack}
        />
      </React.Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
