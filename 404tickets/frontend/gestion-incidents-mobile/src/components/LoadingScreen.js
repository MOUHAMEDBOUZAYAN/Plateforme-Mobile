// src/components/LoadingScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const LoadingScreen = ({ message = 'Chargement...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingScreen;