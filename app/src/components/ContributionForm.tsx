import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhotoUpload } from './PhotoUpload';
import { useAutoSave } from '../hooks/useAutoSave';
import { useContribution } from '../hooks/useContribution';

const formSchema = z.object({
  text: z.string().min(1, 'Please enter your contribution.'),
  photoUri: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  sessionId: string;
  participantId: string;
  gameType: string;
  onSuccess: () => void;
}

export function ContributionForm({ sessionId, participantId, gameType, onSuccess }: Props) {
  const { contribution, submitContribution, saveDraft, loading } = useContribution(sessionId, participantId);
  const autoSaveKey = `draft_${sessionId}_${participantId}`;

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      photoUri: '',
    },
  });

  const currentValues = watch();

  const { clearAutoSave } = useAutoSave(
    autoSaveKey,
    currentValues,
    5000,
    (savedData) => {
      // Load saved data if it's not empty and we don't already have remote draft state
      if (!contribution && savedData.text) {
        reset(savedData);
      }
    }
  );

  // Load initial remote draft if available
  useEffect(() => {
    if (contribution?.content) {
      reset({
        text: contribution.content.text || '',
        photoUri: contribution.content.photoUri || '',
      });
    }
  }, [contribution, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await submitContribution(data);
      clearAutoSave();
      onSuccess();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft(currentValues);
    } catch (e) {
      console.error(e);
    }
  };

  if (contribution?.status === 'submitted') {
    return (
      <View style={styles.container}>
        <Text style={styles.successText}>Your contribution has been received.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {gameType === 'photo_roulette' && (
        <Controller
          control={control}
          name="photoUri"
          render={({ field: { onChange, value } }) => (
            <PhotoUpload onPhotoSelected={onChange} initialUri={value} />
          )}
        />
      )}

      <Controller
        control={control}
        name="text"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.text && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Write your truth here..."
            placeholderTextColor="#8A867D"
            multiline
            textAlignVertical="top"
          />
        )}
      />
      {errors.text && <Text style={styles.errorText}>{errors.text.message}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft} disabled={loading}>
          <Text style={styles.draftButtonText}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? <ActivityIndicator color="#FAF9F6" /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#D4D2C9',
    borderRadius: 8,
    padding: 16,
    minHeight: 150,
    fontSize: 16,
    fontFamily: 'serif',
    color: '#2C2B29',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#D9534F',
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  draftButton: {
    flex: 1,
    marginRight: 8,
    padding: 16,
    backgroundColor: '#E8E6E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  draftButtonText: {
    color: '#4A4843',
    fontFamily: 'serif',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    padding: 16,
    backgroundColor: '#2C2B29',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FAF9F6',
    fontFamily: 'serif',
    fontWeight: '600',
  },
  successText: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#4A4843',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
