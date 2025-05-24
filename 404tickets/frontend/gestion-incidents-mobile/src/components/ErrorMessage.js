import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, Button } from 'react-native-paper';

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <View style={styles.errorContainer}>
      <Icon source="alert-circle" size={24} color="#B00020" />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Button mode="outlined" onPress={onRetry} style={styles.retryButton}>
          Réessayer
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 10,
  },
});

export default ErrorMessage; 