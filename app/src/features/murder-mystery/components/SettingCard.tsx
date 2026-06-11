import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface SettingCardProps {
  title: string;
  era: string;
  location: string;
  tension: string;
  description: string;
  onSelect: () => void;
  selected?: boolean;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  era,
  location,
  tension,
  description,
  onSelect,
  selected = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, selected && styles.cardSelected]} 
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{era}</Text>
        </View>
      </View>
      
      <Text style={styles.location}>📍 {location}</Text>
      <Text style={styles.tension}>⚡ {tension}</Text>
      
      <View style={styles.divider} />
      
      <Text style={styles.description} numberOfLines={3}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  tension: {
    fontSize: 14,
    color: '#D0021B',
    marginBottom: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  description: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
});
