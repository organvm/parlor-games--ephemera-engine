import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  price?: string;
  isOwned: boolean;
  onPurchase: () => void;
  loading: boolean;
}

export function PurchaseButton({ price, isOwned, onPurchase, loading }: Props) {
  if (isOwned) {
    return (
      <TouchableOpacity style={[styles.button, styles.ownedButton]} disabled>
        <Text style={styles.ownedText}>Owned</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={onPurchase} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#FAF9F6" />
      ) : (
        <Text style={styles.buttonText}>{price ? `Get - ${price}` : 'Get'}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2C2B29',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FAF9F6',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  ownedButton: {
    backgroundColor: '#E8E6E1',
  },
  ownedText: {
    color: '#8A867D',
    fontWeight: '600',
    fontFamily: 'serif',
  },
});
