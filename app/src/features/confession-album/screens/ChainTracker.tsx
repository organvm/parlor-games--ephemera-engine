import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useChain } from '../hooks/useChain';
import { useLocalSearchParams } from 'expo-router';

export const ChainTracker = () => {
  const { questionId } = useLocalSearchParams();
  const { currentPlayer, currentTurn, recordChoice } = useChain();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Turn {currentTurn}</Text>
      <Text style={styles.player}>Current Player: {currentPlayer}</Text>
      
      {questionId && (
        <View style={styles.action}>
          <Text>Selected Question ID: {questionId}</Text>
          <Button title="Remove & Advance Turn" onPress={() => recordChoice(questionId as string)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold' },
  player: { fontSize: 18, marginTop: 16 },
  action: { marginTop: 32, padding: 16, backgroundColor: '#eee' }
});

export default ChainTracker;
