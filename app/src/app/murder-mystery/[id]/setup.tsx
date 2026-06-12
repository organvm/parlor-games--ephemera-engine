import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { ScenarioSetupScreen } from '../../../features/murder-mystery/screens/ScenarioSetupScreen';

export default function MurderMysterySetup() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateSession } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (seed: any) => {
    setIsGenerating(true);
    try {
      await updateSession(id as string, {
        config: { seed } as any
      });
      router.push(`/murder-mystery/${id}/review`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate scenario');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScenarioSetupScreen onGenerate={handleGenerate} isGenerating={isGenerating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
