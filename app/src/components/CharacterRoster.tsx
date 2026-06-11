import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Role } from '../hooks/useCharacterAssignment';

interface Props {
  roles: Role[];
  assignments: { role_id: string }[];
}

export function CharacterRoster({ roles, assignments }: Props) {
  const renderItem = ({ item }: { item: Role }) => {
    const isAssigned = assignments.some(a => a.role_id === item.id);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.roleName}>{item.name}</Text>
          <Text style={[styles.status, isAssigned && styles.statusAssigned]}>
            {isAssigned ? 'Assigned' : 'Available'}
          </Text>
        </View>
        <Text style={styles.archetype}>{item.archetype}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Character Roster</Text>
      <FlatList
        data={roles}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  title: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
  },
  status: {
    fontSize: 12,
    color: '#8A867D',
    textTransform: 'uppercase',
  },
  statusAssigned: {
    color: '#4A8A63',
  },
  archetype: {
    fontSize: 14,
    color: '#4A4843',
    fontStyle: 'italic',
  },
});
