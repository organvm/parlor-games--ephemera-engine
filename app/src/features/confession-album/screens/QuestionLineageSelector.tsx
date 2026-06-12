import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LineagePicker } from '../components/LineagePicker';

export const QuestionLineageSelector = () => {
  const router = useRouter();

  const handleSelect = (lineage: string) => {
    router.push({ pathname: '/board-preview', params: { lineage } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Question Lineage</Text>
      <LineagePicker onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16 }
});

export default QuestionLineageSelector;
