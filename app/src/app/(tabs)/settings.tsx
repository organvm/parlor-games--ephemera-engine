import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../hooks/use-auth';
import { useSettings } from '../../hooks/use-settings';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { notificationPrefs, accessibilityPrefs, updateNotificationPrefs, updateAccessibilityPrefs } = useSettings();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion requested. Please contact support to finalize.');
            // Implement account deletion logic calling Supabase edge function or RPC
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.accountEmail}>{user?.email}</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Invitations</Text>
          <Switch 
            value={notificationPrefs.invitations} 
            onValueChange={(val) => updateNotificationPrefs({ invitations: val })} 
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Reminders</Text>
          <Switch 
            value={notificationPrefs.reminders} 
            onValueChange={(val) => updateNotificationPrefs({ reminders: val })} 
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Game Night</Text>
          <Switch 
            value={notificationPrefs.game_night} 
            onValueChange={(val) => updateNotificationPrefs({ game_night: val })} 
          />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Artifacts</Text>
          <Switch 
            value={notificationPrefs.artifacts} 
            onValueChange={(val) => updateNotificationPrefs({ artifacts: val })} 
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Quiet Hours</Text>
          <Switch 
            value={notificationPrefs.quiet_hours_enabled} 
            onValueChange={(val) => updateNotificationPrefs({ quiet_hours_enabled: val })} 
          />
        </View>
      </View>

      {/* Accessibility & Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility & Display</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>High Contrast</Text>
          <Switch 
            value={accessibilityPrefs.high_contrast} 
            onValueChange={(val) => updateAccessibilityPrefs({ high_contrast: val })} 
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Reduce Motion</Text>
          <Switch 
            value={accessibilityPrefs.reduce_motion} 
            onValueChange={(val) => updateAccessibilityPrefs({ reduce_motion: val })} 
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Written Answer Mode</Text>
          <Switch 
            value={accessibilityPrefs.written_answer_mode} 
            onValueChange={(val) => updateAccessibilityPrefs({ written_answer_mode: val })} 
          />
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.section, styles.actionSection]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
          <Text style={[styles.actionButtonText, styles.destructiveText]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 20, marginTop: 40, marginBottom: 20 },
  section: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 24, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  accountEmail: { fontSize: 16, color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  rowLabel: { fontSize: 16, color: '#333' },
  actionSection: { backgroundColor: 'transparent', padding: 0, shadowOpacity: 0, elevation: 0 },
  actionButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  destructiveText: { color: '#FF3B30' },
  footerSpacer: { height: 40 },
});
