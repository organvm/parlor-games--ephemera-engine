import React from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

export const TheReturn = () => {
  const router = useRouter();

  const handleEnd = () => {
    router.replace('/the-portrait');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>The Return</Text>
      <Text style={styles.desc}>Open floor. Track answers optionally.</Text>
      
      {/* List asked questions here (simplified) */}
      <FlatList
        data={[{ id: '1', text: 'Question 1' }]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.text}</Text>}
      />

      <Button title="End The Return" onPress={handleEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold' },
  desc: { fontSize: 16, marginVertical: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' }
});

export default TheReturn;
