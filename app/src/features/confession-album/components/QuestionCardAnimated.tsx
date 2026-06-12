import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const QuestionCardAnimated = ({ question, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text>{question.text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: '#f9f9f9', borderRadius: 8 }
});
