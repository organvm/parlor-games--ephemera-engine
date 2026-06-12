import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useContributionArchetypes } from '../hooks/useContributionArchetypes';

export const ArchetypeAssigner = ({ players }: { players: string[] }) => {
  const archetypes = ['the_confessor', 'the_observer', 'the_instigator'];
  const { assignments, autoAssign } = useContributionArchetypes(players, archetypes);

  return (
    <View style={styles.container}>
      <Button title="Auto Assign" onPress={autoAssign} />
      {players.map(p => (
        <Text key={p}>{p}: {assignments[p] || 'unassigned'}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 }
});
