import React from 'react';
import { View, Text, Button, Share, ActivityIndicator, StyleSheet } from 'react-native';
import { useInvitationToken } from '../hooks/useInvitationToken';

interface Props {
  sessionId: string;
  sessionName: string;
}

export function InvitationComposer({ sessionId, sessionName }: Props) {
  const { token, loading, createSharedToken } = useInvitationToken(sessionId);

  const handleShare = async () => {
    if (!token) return;
    const url = `https://ephemera.app/invite/${token}`;
    try {
      await Share.share({
        message: `You're invited to play ${sessionName} on Ephemera! Join here: ${url}`,
        url,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Players</Text>
      {!token ? (
        <View style={styles.actionContainer}>
          <Text style={styles.desc}>Generate a unique invitation link to share with your friends.</Text>
          <Button title="Generate Link" onPress={createSharedToken} />
        </View>
      ) : (
        <View style={styles.actionContainer}>
          <Text style={styles.linkText}>https://ephemera.app/invite/{token.slice(0, 8)}...</Text>
          <Button title="Share Link" onPress={handleShare} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  actionContainer: {
    marginTop: 8,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#eaeaea',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    color: '#333',
  },
});
