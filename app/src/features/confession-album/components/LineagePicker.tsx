import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const LineagePicker = ({ onSelect }: { onSelect: (lineage: string) => void }) => {
  const lineages = [
    { id: 'classic_proust', name: 'Classic Proust', desc: 'The original 1886 questions' },
    { id: 'vanity_fair', name: 'Vanity Fair', desc: 'Modern pop-culture variations' },
    { id: 'pivot_lipton', name: 'Pivot/Lipton', desc: 'The famous ten questions' },
    { id: 'thematic_remix', name: 'Thematic Remix', desc: 'Deep philosophical inquiries' },
    { id: 'surprise_me', name: 'Surprise me', desc: 'A balanced mix of everything' },
  ];

  return (
    <View style={styles.container}>
      {lineages.map((l) => (
        <TouchableOpacity key={l.id} style={styles.card} onPress={() => onSelect(l.id)}>
          <Text style={styles.title}>{l.name}</Text>
          <Text style={styles.desc}>{l.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, marginBottom: 12, backgroundColor: '#eee', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666' }
});
