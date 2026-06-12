import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBoard } from '../hooks/useBoard';
import { BoardGrid } from '../components/BoardGrid';
import { BUNDLED_QUESTIONS } from '../data/bundled-questions';
import { useRouter } from 'expo-router';

export const DigitalBoard = () => {
  const { questions, removeQuestion, remaining } = useBoard(BUNDLED_QUESTIONS);
  const router = useRouter();

  const handleSelect = (q: any) => {
    // Navigate to Chain Tracker passing selected question
    router.push({ pathname: '/chain-tracker', params: { questionId: q.id } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Remaining: {remaining}</Text>
      <BoardGrid questions={questions} onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16 }
});

export default DigitalBoard;
