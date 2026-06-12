import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accusation } from '../types/murder-mystery';

interface AccusationBlockProps {
  accusation: Accusation;
  accuserName?: string;
  targetName?: string;
}

export const AccusationBlock: React.FC<AccusationBlockProps> = ({
  accusation,
  accuserName = 'Someone',
  targetName = 'Unknown Target',
}) => {
  return (
    <View 
      style={[styles.container, { minHeight: 48 }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${accuserName} accuses ${targetName}. Method: ${accusation.method}. Motive: ${accusation.motive}.`}
    >
      <Text style={styles.header}>
        <Text style={styles.accuser}>{accuserName}</Text> accuses <Text style={styles.target}>{targetName}</Text>
      </Text>
      
      <View style={styles.detailSection}>
        <Text style={styles.label}>Method:</Text>
        <Text style={styles.text}>{accusation.method}</Text>
      </View>
      
      <View style={styles.detailSection}>
        <Text style={styles.label}>Motive:</Text>
        <Text style={styles.text}>{accusation.motive}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    marginBottom: 16,
  },
  header: {
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 12,
  },
  accuser: {
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  target: {
    fontWeight: 'bold',
    color: '#f87171',
  },
  detailSection: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  }
});
