import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { QuestionCardAnimated } from './QuestionCardAnimated';

export const BoardGrid = ({ questions, onSelect }: any) => {
  return (
    <FlatList
      data={questions}
      numColumns={2}
      keyExtractor={q => q.id}
      renderItem={({ item }) => <QuestionCardAnimated question={item} onPress={() => onSelect(item)} />}
    />
  );
};
