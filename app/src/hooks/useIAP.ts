import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useIAP(productIds: string[]) {
  const { session } = useAuthStore();
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    async function initIAP() {
      try {
        await RNIap.initConnection();
        if (Platform.OS === 'android') {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        if (productIds.length > 0) {
          const items = await RNIap.getProducts({ skus: productIds });
          setProducts(items);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }

      purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt && session?.user) {
          try {
            // Verify receipt with edge function
            const { data, error } = await supabase.functions.invoke('verify-iap', {
              body: { 
                receipt, 
                platform: Platform.OS, 
                productId: purchase.productId 
              }
            });

            if (!error && data?.valid) {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
            }
          } catch (e) {
            console.error(e);
          }
        }
      });

      purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.warn('purchaseErrorListener', error);
      });
    }

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      RNIap.endConnection();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only init once, but would ideally react to productIds changing

  const requestPurchase = async (sku: string) => {
    try {
      setLoading(true);
      await RNIap.requestPurchase({ sku });
    } catch (err) {
      console.warn(err);
      setLoading(false);
    }
  };

  const restorePurchases = useCallback(async () => {
    try {
      setLoading(true);
      const purchases = await RNIap.getAvailablePurchases();
      for (const purchase of purchases) {
        if (session?.user) {
          // Just verify and record them in DB
          await supabase.functions.invoke('verify-iap', {
            body: { 
              receipt: purchase.transactionReceipt, 
              platform: Platform.OS, 
              productId: purchase.productId 
            }
          });
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  return { products, requestPurchase, restorePurchases, loading };
}
