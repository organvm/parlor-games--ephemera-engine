import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCharacterAssignment, Role } from '../hooks/useCharacterAssignment';

interface Props {
  sessionId: string;
  hostId: string;
  participants: { id: string, user_id?: string, status: string }[];
  roles: Role[];
}

export function CharacterAssignment({ sessionId, hostId, participants, roles }: Props) {
  const { assignments, assignRole, autoAssign, loading } = useCharacterAssignment(sessionId);

  const handleAutoAssign = () => {
    autoAssign(participants, roles, hostId);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8A867D" />
      </View>
    );
  }

  const renderParticipant = ({ item }: { item: any }) => {
    const assignment = assignments.find(a => a.participant_id === item.id);
    const assignedRole = roles.find(r => r.id === assignment?.role_id);

    return (
      <View style={styles.row}>
        <Text style={styles.participantName}>{item.user_id ? 'Joined Player' : 'Guest'}</Text>
        <Text style={styles.roleName}>{assignedRole ? assignedRole.name : 'Unassigned'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Character Assignment</Text>
        <TouchableOpacity style={styles.autoBtn} onPress={handleAutoAssign}>
          <Text style={styles.autoBtnText}>Auto-Assign</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={participants}
        keyExtractor={p => p.id}
        renderItem={renderParticipant}
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
  center: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  title: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
  },
  autoBtn: {
    backgroundColor: '#2C2B29',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  autoBtnText: {
    color: '#FAF9F6',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  list: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  participantName: {
    fontSize: 16,
    color: '#2C2B29',
  },
  roleName: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#8A867D',
    fontStyle: 'italic',
  },
});
