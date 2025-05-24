import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, Button } from 'react-native-paper';

export const EmptyState = ({ 
  title, 
  description, 
  iconName = "ticket-outline", 
  actionText, 
  onAction 
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Icon source={iconName} size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionText && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.emptyButton}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 20,
  },
});

export default EmptyState; 