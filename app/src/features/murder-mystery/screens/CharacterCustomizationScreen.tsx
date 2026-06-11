import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { CharacterEntry } from '../components/CharacterEntry';
import { Character, MurderMysteryData } from '../types/murder-mystery';

export interface Participant {
  id: string;
  name: string;
  status: 'JOINED' | 'RSVP' | 'PENDING';
}

export interface CharacterCustomizationScreenProps {
  scenario: MurderMysteryData;
  participants: Participant[];
  onSaveCharacter: (character: Character) => void;
  onAssignCharacter: (characterId: string, participantId: string | null) => void;
  onDeliverPackets: () => void;
  isDelivering?: boolean;
}

export const CharacterCustomizationScreen: React.FC<CharacterCustomizationScreenProps> = ({
  scenario,
  participants,
  onSaveCharacter,
  onAssignCharacter,
  onDeliverPackets,
  isDelivering = false
}) => {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [assigningCharacterId, setAssigningCharacterId] = useState<string | null>(null);

  const getAssignedName = (participantId: string | null) => {
    if (!participantId) return undefined;
    return participants.find(p => p.id === participantId)?.name;
  };

  const handleSaveEdit = () => {
    if (editingCharacter) {
      onSaveCharacter(editingCharacter);
      setEditingCharacter(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Roster & Assignment</Text>
      <Text style={styles.headerSubtitle}>
        Review character profiles, assign them to your guests, and deliver their top-secret briefings.
      </Text>

      <ScrollView style={styles.list}>
        {scenario.characters.map(character => (
          <View key={character.id} style={styles.characterContainer}>
            <CharacterEntry 
              character={character}
              showSecret={true}
              assignedGuestName={getAssignedName(character.assigned_to)}
            />
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setEditingCharacter({ ...character })}
              >
                <Text style={styles.actionButtonText}>Edit Role</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.assignButton]}
                onPress={() => setAssigningCharacterId(character.id)}
              >
                <Text style={styles.assignButtonText}>
                  {character.assigned_to ? 'Change Assignment' : 'Assign to Guest'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.deliverButton, isDelivering && styles.disabledButton]} 
          onPress={onDeliverPackets}
          disabled={isDelivering}
        >
          <Text style={styles.deliverButtonText}>
            {isDelivering ? 'Delivering...' : 'Deliver Character Packets'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      {editingCharacter && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Character</Text>
              
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input}
                value={editingCharacter.name}
                onChangeText={t => setEditingCharacter({...editingCharacter, name: t})}
              />

              <Text style={styles.label}>Occupation</Text>
              <TextInput 
                style={styles.input}
                value={editingCharacter.occupation}
                onChangeText={t => setEditingCharacter({...editingCharacter, occupation: t})}
              />

              <Text style={styles.label}>Secret</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                value={editingCharacter.secret}
                onChangeText={t => setEditingCharacter({...editingCharacter, secret: /* allow-secret */ t})}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingCharacter(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Assignment Modal */}
      {assigningCharacterId && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Assign to Guest</Text>
              
              <TouchableOpacity 
                style={styles.participantRow}
                onPress={() => {
                  onAssignCharacter(assigningCharacterId, null);
                  setAssigningCharacterId(null);
                }}
              >
                <Text style={styles.unassignText}>Unassigned (Nobody)</Text>
              </TouchableOpacity>

              <FlatList
                data={participants}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.participantRow}
                    onPress={() => {
                      onAssignCharacter(assigningCharacterId, item.id);
                      setAssigningCharacterId(null);
                    }}
                  >
                    <Text style={styles.participantName}>{item.name}</Text>
                    <Text style={styles.participantStatus}>{item.status}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity 
                style={styles.cancelButtonFull} 
                onPress={() => setAssigningCharacterId(null)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  characterContainer: {
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: -8, // Pull up closer to the card
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  assignButton: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  actionButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  assignButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deliverButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  deliverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  participantStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  unassignText: {
    fontSize: 16,
    color: '#EF4444',
    fontStyle: 'italic',
  },
  cancelButtonFull: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  }
});
