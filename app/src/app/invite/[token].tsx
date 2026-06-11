import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useDeepLink } from '../../hooks/useDeepLink';
import { useRouter } from 'expo-router';
import { SessionInvitation } from '../../components/SessionInvitation';

export default function InviteScreen() {
  const { token, resolution, loading } = useDeepLink();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Resolving invitation...</Text>
      </View>
    );
  }

  if (!resolution) {
    return null;
  }

  if (!resolution.valid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{resolution.message}</Text>
        <Button title="Go Home" onPress={() => router.replace('/')} />
      </View>
    );
  }

  if (resolution.alreadyRsvped) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You have already RSVP'd to this session.</Text>
        <Button 
          title="Go to Session" 
          onPress={() => router.replace(`/(tabs)/session/${resolution.session?.id}` as any)} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SessionInvitation
        sessionId={resolution.session!.id}
        sessionName={resolution.session!.name}
        gameType={resolution.session!.game_type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
});
