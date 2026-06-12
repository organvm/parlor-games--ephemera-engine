import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Character } from '../types/murder-mystery';
import { Ionicons } from '@expo/vector-icons';

interface AwardCategoryCardProps {
  category: string;
  nominees: Character[];
  selectedNomineeId?: string;
  onSelect: (nomineeId: string) => void;
}

export const AwardCategoryCard: React.FC<AwardCategoryCardProps> = ({
  category,
  nominees,
  selectedNomineeId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle} accessibilityRole="header">{category}</Text>
      
      <View style={styles.nomineeList}>
        {nominees.map(nominee => {
          const isSelected = selectedNomineeId === nominee.id;
          
          return (
            <TouchableOpacity 
              key={nominee.id}
              style={[
                styles.nomineeRow,
                isSelected && styles.nomineeRowSelected,
                { minHeight: 48 }
              ]}
              onPress={() => onSelect(nominee.id)}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Nominate ${nominee.name}, ${nominee.occupation}`}
            >
              <Text style={[
                styles.nomineeName,
                isSelected && styles.nomineeNameSelected
              ]}>
                {nominee.name} ({nominee.occupation})
              </Text>
              
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#fcd34d" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fcd34d',
    marginBottom: 16,
  },
  nomineeList: {
    gap: 8,
  },
  nomineeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  nomineeRowSelected: {
    borderColor: '#fcd34d',
    backgroundColor: '#4b5563',
  },
  nomineeName: {
    fontSize: 16,
    color: '#d1d5db',
  },
  nomineeNameSelected: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
