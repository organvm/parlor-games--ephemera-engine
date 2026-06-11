import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useContentPacks, ContentPack } from '../hooks/useContentPacks';

export function StoreHome() {
  const router = useRouter();
  const { packs, loading } = useContentPacks();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8A867D" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ContentPack }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/store/${item.id}` as any)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={styles.cardAction}>
        {item.is_owned ? (
          <Text style={styles.ownedText}>Owned</Text>
        ) : (
          <Text style={styles.priceText}>{item.is_free ? 'Free' : 'Premium'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Content Library</Text>
      <FlatList
        data={packs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
    padding: 24,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E6E1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2C2B29',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#8A867D',
    lineHeight: 20,
  },
  cardAction: {
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedText: {
    color: '#4A8A63',
    fontWeight: '600',
    fontSize: 14,
  },
  priceText: {
    color: '#2C2B29',
    fontWeight: '600',
    fontSize: 14,
  },
});
