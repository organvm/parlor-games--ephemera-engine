import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useArtifactStatus } from '../hooks/useArtifactStatus';

export const ArtifactGeneration = ({ sessionId }: { sessionId: string }) => {
  const { status, generate } = useArtifactStatus(sessionId);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Artifact Generation</Text>
      <Text>Status: {status}</Text>
      {status === 'pending' && <Button title="Generate Artifacts" onPress={generate} />}
      {status === 'ready' && <Text style={styles.success}>Artifacts Ready for Distribution!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold' },
  success: { color: 'green', marginTop: 16 }
});

export default ArtifactGeneration;
