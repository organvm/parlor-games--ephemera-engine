import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { RegisterBadge } from './RegisterBadge';

export const QuestionCard = ({ question, isSelected, onToggle }: any) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{question.text}</Text>
      <RegisterBadge register={question.metadata?.register || 'casual'} />
      <Switch value={isSelected} onValueChange={() => onToggle(question)} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { flex: 1, marginRight: 8 }
});
