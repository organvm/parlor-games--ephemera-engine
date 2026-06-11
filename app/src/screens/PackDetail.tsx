import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useContentPacks } from '../hooks/useContentPacks';
import { useIAP } from '../hooks/useIAP';
import { PurchaseButton } from '../components/PurchaseButton';
import { useContentLibrary } from '../hooks/useContentLibrary';

interface Props {
  packId: string;
}

export function PackDetail({ packId }: Props) {
  const { packs, loading: packsLoading } = useContentPacks();
  
  const pack = useMemo(() => packs.find(p => p.id === packId), [packs, packId]);
  
  const { products, requestPurchase, loading: iapLoading } = useIAP(
    pack?.external_product_id && !pack.is_free ? [pack.external_product_id] : []
  );

  const { downloadPack, downloading } = useContentLibrary();

  if (packsLoading || !pack) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8A867D" />
      </View>
    );
  }

  const product = products.find(p => p.productId === pack.external_product_id);
  const isDownloading = downloading[pack.id];

  const handlePurchaseOrDownload = async () => {
    if (pack.is_owned) {
      await downloadPack(pack);
      Alert.alert('Downloaded', 'Content pack has been downloaded successfully.');
    } else if (pack.is_free) {
      await downloadPack(pack);
      Alert.alert('Downloaded', 'Free content pack added to library.');
    } else if (product) {
      await requestPurchase(product.productId);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameType}>{pack.game_type.replace('_', ' ')}</Text>
        <Text style={styles.title}>{pack.title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{pack.description}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Version {pack.version}</Text>
        </View>

        <View style={styles.actionSection}>
          <PurchaseButton 
            isOwned={!!pack.is_owned} 
            price={product?.localizedPrice} 
            onPurchase={handlePurchaseOrDownload}
            loading={iapLoading || !!isDownloading}
          />
          {pack.is_owned && !isDownloading && (
            <Text style={styles.downloadHint}>Tap to download to this device</Text>
          )}
        </View>
      </View>
    </ScrollView>
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
    padding: 24,
    backgroundColor: '#E8E6E1',
    borderBottomWidth: 1,
    borderBottomColor: '#D4D2C9',
  },
  gameType: {
    fontSize: 12,
    color: '#8A867D',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2C2B29',
    fontFamily: 'serif',
  },
  content: {
    padding: 24,
  },
  description: {
    fontSize: 16,
    color: '#4A4843',
    lineHeight: 24,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  metaText: {
    fontSize: 14,
    color: '#8A867D',
  },
  actionSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  downloadHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#8A867D',
  },
});
