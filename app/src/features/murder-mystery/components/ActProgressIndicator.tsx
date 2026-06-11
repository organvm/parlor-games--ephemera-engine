import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActProgressIndicatorProps {
  currentAct: number;
}

export const ActProgressIndicator: React.FC<ActProgressIndicatorProps> = ({ currentAct }) => {
  const acts = [1, 2, 3];

  return (
    <View style={styles.container}>
      {acts.map((act, index) => {
        const isCompleted = currentAct > act;
        const isActive = currentAct === act;
        const isFuture = currentAct < act;

        return (
          <React.Fragment key={act}>
            <View style={styles.actContainer}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                  isFuture && styles.circleFuture,
                ]}
              >
                <Text
                  style={[
                    styles.actText,
                    (isCompleted || isActive) && styles.textLight,
                    isFuture && styles.textDark,
                  ]}
                >
                  {act}
                </Text>
              </View>
              <Text
                style={[
                  styles.actLabel,
                  isActive && styles.labelActive,
                  isFuture && styles.labelFuture,
                ]}
              >
                Act {act}
              </Text>
            </View>
            {index < acts.length - 1 && (
              <View
                style={[
                  styles.line,
                  (isCompleted || (isActive && currentAct > act)) && styles.lineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleCompleted: {
    backgroundColor: '#10b981', // emerald-500
  },
  circleActive: {
    backgroundColor: '#3b82f6', // blue-500
    borderWidth: 2,
    borderColor: '#93c5fd', // blue-300
  },
  circleFuture: {
    backgroundColor: '#e5e7eb', // gray-200
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
  },
  actText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textLight: {
    color: '#ffffff',
  },
  textDark: {
    color: '#6b7280', // gray-500
  },
  actLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563', // gray-600
  },
  labelActive: {
    color: '#1f2937', // gray-800
    fontWeight: 'bold',
  },
  labelFuture: {
    color: '#9ca3af', // gray-400
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb', // gray-200
    marginHorizontal: 8,
    marginBottom: 20, // Align with the circles, not the labels
  },
  lineCompleted: {
    backgroundColor: '#10b981', // emerald-500
  },
});
