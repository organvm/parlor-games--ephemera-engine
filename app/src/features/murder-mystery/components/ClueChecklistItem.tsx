import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ClueChecklistItemProps {
  clueId: string;
  title: string;
  type: string;
  isFound: boolean;
  foundBy?: string;
  onToggleFound: (clueId: string) => void;
}

export const ClueChecklistItem: React.FC<ClueChecklistItemProps> = ({
  clueId,
  title,
  type,
  isFound,
  foundBy,
  onToggleFound,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isFound && styles.containerFound]}
      onPress={() => onToggleFound(clueId)}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isFound ? 'checkbox' : 'square-outline'}
            size={24}
            color={isFound ? '#10b981' : '#9ca3af'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isFound && styles.titleFound]}>{title}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{type}</Text>
            </View>
            {isFound && foundBy && (
              <Text style={styles.foundByText}>Found by: {foundBy}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  containerFound: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1fae5',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  titleFound: {
    color: '#4b5563',
    textDecorationLine: 'line-through',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  foundByText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
