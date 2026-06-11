import { View, Text, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
export default function Home() { return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Home Screen</Text><Button title="Sign Out" onPress={() => supabase.auth.signOut()} /></View>; }
