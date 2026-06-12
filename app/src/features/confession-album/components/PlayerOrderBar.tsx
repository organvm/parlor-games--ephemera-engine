import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const PlayerOrderBar = ({ players, currentIndex }: { players: string[], currentIndex: number }) => {
  return (
    <View style={styles.bar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {players.map((player, idx) => {
          const isCurrent = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          return (
            <View key={player} style={[styles.player, isCurrent && styles.current, isCompleted && styles.completed]}>
              <Text style={[styles.text, isCurrent && styles.currentText]}>{player}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { height: 60, backgroundColor: '#f0f0f0', borderTopWidth: 1, borderColor: '#ddd', padding: 8 },
  player: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#fff' },
  current: { backgroundColor: '#007aff' },
  completed: { opacity: 0.5 },
  text: { fontSize: 14, color: '#333' },
  currentText: { color: '#fff', fontWeight: 'bold' }
});
