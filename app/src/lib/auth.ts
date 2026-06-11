import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    if (credential.identityToken) {
      return supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken, // allow-secret
      });
    } else {
      throw new Error('No identityToken.');
    }
  } catch (e: any) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      // handle that the user canceled the sign-in flow
      return { data: null, error: new Error('User canceled.') };
    } else {
      // handle other errors
      return { data: null, error: e };
    }
  }
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.data?.idToken) {
      return supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken, // allow-secret
      });
    } else {
      throw new Error('no ID token present!');
    }
  } catch (error: any) {
    return { data: null, error };
  }
};
