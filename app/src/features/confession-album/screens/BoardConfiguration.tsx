import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useBoardConfigStore } from '../stores/boardConfigStore';
import { BoardFormat, BoardLayout } from '../types/confession-album';

export const BoardConfiguration = () => {
  const { format, layout, setFormat, setLayout } = useBoardConfigStore();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Board Configuration</Text>
      
      <Text>Format: {format}</Text>
      <Button title="Set Classic" onPress={() => setFormat(BoardFormat.CLASSIC)} />
      <Button title="Set Modern" onPress={() => setFormat(BoardFormat.MODERN)} />
      
      <Text>Layout: {layout}</Text>
      <Button title="Set Grid" onPress={() => setLayout(BoardLayout.GRID)} />
      <Button title="Set List" onPress={() => setLayout(BoardLayout.LIST)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
});

export default BoardConfiguration;
