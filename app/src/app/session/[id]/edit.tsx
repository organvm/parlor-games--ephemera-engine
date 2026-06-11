import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../hooks/use-session';

export default function EditSessionConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSession, updateSession } = useSession();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (id) {
        const data = await getSession(id);
        if (data) {
          setConfig(data.config || {});
        }
      }
      setLoading(false);
    };
    fetchSession();
  }, [id]);

  const handleConfigChange = useCallback((key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  }, []);

  // Simple auto-save on blur or switch toggle
  const saveConfig = async (newConfig: any) => {
    if (!id) return;
    setSaving(true);
    await updateSession(id, { config: newConfig });
    setSaving(false);
  };

  const handleToggle = (key: string, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleBlur = () => {
    saveConfig(config);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration</Text>
        {saving && <ActivityIndicator size="small" />}
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Guest Count</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={config?.guestCount?.toString() || '8'}
            onChangeText={(text) => handleConfigChange('guestCount', parseInt(text) || 8)}
            onBlur={handleBlur}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Enable Custom Themes</Text>
          <Switch
            value={!!config?.allowCustomThemes}
            onValueChange={(val) => handleToggle('allowCustomThemes', val)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});
