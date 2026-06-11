import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useContributionMatrix, MatrixRow } from '../hooks/useContributionMatrix';

interface Props {
  sessionId: string;
}

export function ContributionDashboard({ sessionId }: Props) {
  const { matrix, loading } = useContributionMatrix(sessionId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8A867D" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: MatrixRow }) => {
    let statusText = 'Pending';
    let statusColor = '#8A867D';

    if (item.contribution) {
      switch (item.contribution.status) {
        case 'draft':
          statusText = 'Drafting';
          statusColor = '#E6A838'; // Yellow/Orange
          break;
        case 'submitted':
          statusText = 'Ready';
          statusColor = '#4A8A63'; // Green
          break;
        case 'approved':
          statusText = 'Approved';
          statusColor = '#2C2B29'; // Dark
          break;
        case 'rejected':
          statusText = 'Rejected';
          statusColor = '#D9534F'; // Red
          break;
      }
    } else {
      // Check if overdue based on time or just pending
      // For simplicity, we just say Pending
    }

    return (
      <View style={styles.row}>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.user_id ? 'Joined Player' : 'Guest'}</Text>
          <Text style={styles.participantStatus}>{item.status}</Text>
        </View>
        <View style={styles.contributionInfo}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contribution Matrix</Text>
      <FlatList
        data={matrix}
        keyExtractor={(item) => item.id}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E1',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2B29',
    marginBottom: 4,
  },
  participantStatus: {
    fontSize: 12,
    color: '#8A867D',
    textTransform: 'capitalize',
  },
  contributionInfo: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
