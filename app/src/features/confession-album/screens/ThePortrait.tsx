import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { usePortrait } from '../hooks/usePortrait';
import { AnswerPairCard } from '../components/AnswerPairCard';
import { useRouter } from 'expo-router';

export const ThePortrait = () => {
  const { pairs, completeSession } = usePortrait();
  const router = useRouter();

  const handleEnd = () => {
    completeSession();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>The Portrait</Text>
      <FlatList
        horizontal
        snapToInterval={332}
        showsHorizontalScrollIndicator={false}
        data={pairs}
        keyExtractor={p => p.id}
        renderItem={({ item }) => <AnswerPairCard pair={item} />}
      />
      <Button title="End Game Night" onPress={handleEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfbf8', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 28, marginTop: 40, marginBottom: 20 }
});

export default ThePortrait;
