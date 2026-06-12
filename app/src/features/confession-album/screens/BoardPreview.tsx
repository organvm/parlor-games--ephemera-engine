import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useQuestionSet } from '../hooks/useQuestionSet';
import { QuestionCard } from '../components/QuestionCard';
import { BUNDLED_QUESTIONS } from '../data/bundled-questions';
import { useLocalSearchParams } from 'expo-router';
import { filterQuestionsByLineage } from '../utils/questionFilters';

export const BoardPreview = () => {
  const { lineage } = useLocalSearchParams();
  const { selectedQuestions, toggleQuestion } = useQuestionSet();
  
  const availableQuestions = filterQuestionsByLineage(BUNDLED_QUESTIONS, (lineage as string) || 'surprise_me');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Board Preview</Text>
      <Text>Selected: {selectedQuestions.length}</Text>
      <FlatList
        data={availableQuestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuestionCard 
            question={item} 
            isSelected={!!selectedQuestions.find(q => q.id === item.id)}
            onToggle={toggleQuestion}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16 }
});

export default BoardPreview;
