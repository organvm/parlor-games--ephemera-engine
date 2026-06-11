import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useDeepLink } from '../../src/hooks/useDeepLink';
import { useRouter } from 'expo-router';

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
      <Text style={styles.title}>You've been invited!</Text>
      <Text style={styles.text}>Session: {resolution.session?.name}</Text>
      <Text style={styles.text}>Game Type: {resolution.session?.game_type}</Text>
      {/* 
        This is a placeholder for T011's SessionInvitation component.
        For now, we just show a button to navigate to the RSVP flow, or simply "RSVP".
      */}
      <Button title="Join Session" onPress={() => {
        // T011 will implement the actual RSVP mutation and redirect
      }} />
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
