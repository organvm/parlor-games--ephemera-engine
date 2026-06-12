import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AnswerPairCard = ({ pair }: { pair: any }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>Question ID: {pair.questionId}</Text>
      <Text style={styles.answer}>{pair.chooser}: {pair.chooserAnswer}</Text>
      <Text style={styles.answer}>{pair.inheritor}: {pair.inheritorAnswer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: 300, padding: 24, margin: 16, backgroundColor: '#fffaf0', borderRadius: 12, shadowOpacity: 0.1, shadowRadius: 4 },
  question: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  answer: { fontSize: 16, marginBottom: 8 }
});
