import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export const PlayerOrderConfig = ({ players }: { players: string[] }) => {
  const [order, setOrder] = useState(players);

  const randomize = () => {
    setOrder([...order].sort(() => Math.random() - 0.5));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Order Configuration</Text>
      <Button title="Randomize" onPress={randomize} />
      {order.map((p, i) => <Text key={p}>{i + 1}. {p}</Text>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 }
});
