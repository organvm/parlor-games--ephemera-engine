import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const RegisterBadge = ({ register }: { register: string }) => (
  <View style={styles.badge}>
    <Text style={styles.text}>{register}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { padding: 4, backgroundColor: '#d0d0d0', borderRadius: 4 },
  text: { fontSize: 10 }
});
