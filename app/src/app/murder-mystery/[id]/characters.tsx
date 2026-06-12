import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';
import { CharacterCustomizationScreen, Participant } from '../../../features/murder-mystery/screens/CharacterCustomizationScreen';
import { MurderMysteryData, Character } from '../../../features/murder-mystery/types/murder-mystery';

export default function MurderMysteryCharacters() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, updateSession } = useSession();
  const [isDelivering, setIsDelivering] = useState(false);

  const scenario = session?.config?.scenario as MurderMysteryData;
  const participants = session?.participants?.map(p => ({
    id: p.id,
    name: p.users?.display_name || p.users?.email || 'Unknown',
    status: p.status
  })) as Participant[] || [];

  if (!scenario) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSaveCharacter = async (updatedCharacter: Character) => {
    const updatedCharacters = scenario.characters.map(c => 
      c.id === updatedCharacter.id ? updatedCharacter : c
    );
    await updateSession(id as string, {
      config: { ...session?.config, scenario: { ...scenario, characters: updatedCharacters } } as any
    });
  };

  const handleAssignCharacter = async (characterId: string, participantId: string | null) => {
    const updatedCharacters = scenario.characters.map(c => 
      c.id === characterId ? { ...c, assigned_to: participantId } : c
    );
    await updateSession(id as string, {
      config: { ...session?.config, scenario: { ...scenario, characters: updatedCharacters } } as any
    });
  };

  const handleDeliverPackets = async () => {
    setIsDelivering(true);
    try {
      // Transition to clues distribution phase
      router.push(`/murder-mystery/${id}/clues`);
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <View style={styles.container}>
      <CharacterCustomizationScreen 
        scenario={scenario} 
        participants={participants}
        onSaveCharacter={handleSaveCharacter}
        onAssignCharacter={handleAssignCharacter}
        onDeliverPackets={handleDeliverPackets}
        isDelivering={isDelivering}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
