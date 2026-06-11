import * as Linking from 'expo-linking';
import { Share } from 'react-native';

const PREFIX = Linking.createURL('/');

export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getInviteLink = (inviteCode: string): string => {
  // Use universal link pattern or custom scheme
  return `https://ephemera.app/join/${inviteCode}`;
};

export const shareInviteLink = async (inviteCode: string, sessionName: string) => {
  const url = getInviteLink(inviteCode);
  try {
    await Share.share({
      message: `Join my session "${sessionName}" on Ephemera!\n\nLink: ${url}\nCode: ${inviteCode}`,
      url: url,
      title: 'Join Ephemera Session',
    });
  } catch (error) {
    console.error('Error sharing', error);
  }
};
