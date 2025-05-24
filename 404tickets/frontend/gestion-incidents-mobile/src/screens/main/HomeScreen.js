// src/screens/main/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorMessage } from '../../components/ErrorMessage';
import ticketService from '../../services/ticketService';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();

  // Recharger les données quand l'écran est focalisé
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      setError('');
      const data = await ticketService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bonjour, {user?.name || user?.email}
        </Text>
        <Text style={styles.subtitle}>
          Voici un aperçu de vos tickets
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsCardContent}>
            <Text style={styles.statsNumber}>{stats.totalTickets}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: '#FFC107' }]}>
          <Card.Content style={styles.statsCardContent}>
            <Text style={[styles.statsNumber, styles.whiteText]}>
              {stats.pendingTickets}
            </Text>
            <Text style={[styles.statsLabel, styles.whiteText]}>En attente</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: '#2196F3' }]}>
          <Card.Content style={styles.statsCardContent}>
            <Text style={[styles.statsNumber, styles.whiteText]}>
              {stats.inProgressTickets}
            </Text>
            <Text style={[styles.statsLabel, styles.whiteText]}>En cours</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: '#4CAF50' }]}>
          <Card.Content style={styles.statsCardContent}>
            <Text style={[styles.statsNumber, styles.whiteText]}>
              {stats.resolvedTickets}
            </Text>
            <Text style={[styles.statsLabel, styles.whiteText]}>Résolus</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            icon="ticket-plus"
            onPress={() => navigation.navigate('Tickets', { 
              screen: 'CreateTicket' 
            })}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Nouveau ticket
          </Button>

          <Button
            mode="contained"
            icon="ticket"
            onPress={() => navigation.navigate('Tickets')}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Voir mes tickets
          </Button>

          {isAdmin() && (
            <Button
              mode="contained"
              icon="shield-account"
              onPress={() => navigation.navigate('Admin')}
              style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
              contentStyle={styles.buttonContent}
            >
              Administration
            </Button>
          )}
        </View>
      </View>

      {/* Help Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Besoin d'aide ?</Text>
          <Text style={styles.infoText}>
            Si vous rencontrez des problèmes techniques, créez un nouveau ticket 
            et notre équipe de support vous assistera dans les plus brefs délais.
          </Text>
          <Button
            mode="outlined"
            icon="help-circle"
            onPress={() => navigation.navigate('Tickets', { 
              screen: 'CreateTicket' 
            })}
            style={styles.helpButton}
          >
            Créer un ticket
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    marginBottom: 10,
    elevation: 2,
  },
  statsCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  whiteText: {
    color: '#fff',
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    marginBottom: 10,
  },
  buttonContent: {
    height: 48,
  },
  infoCard: {
    margin: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButton: {
    marginTop: 8,
  },
});

export default HomeScreen;