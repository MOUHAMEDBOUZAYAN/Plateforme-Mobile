// src/screens/main/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Dimensions,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Text, Card, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorMessage } from '../../components/ErrorMessage';
import ticketService from '../../services/ticketService';
import { useFocusEffect } from '@react-navigation/native';
import { TabActions, StackActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, isAdmin } = useAuth();

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Recharger les données quand l'écran est focalisé
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      setError('');
      const response = await ticketService.getAllTickets();
      const ticketsArray = Array.isArray(response.tickets) ? response.tickets : [];
      
      // Calculate stats from tickets data
      const calculatedStats = {
        totalTickets: ticketsArray.length,
        pendingTickets: ticketsArray.filter(t => t.status === 'pending').length,
        inProgressTickets: ticketsArray.filter(t => t.status === 'in_progress').length,
        resolvedTickets: ticketsArray.filter(t => t.status === 'resolved').length,
        closedTickets: ticketsArray.filter(t => t.status === 'closed').length
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Impossible de charger les statistiques');
      setStats({
        totalTickets: 0,
        pendingTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0
      });
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const StatCard = ({ title, value, color, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCardContainer}>
      <LinearGradient
        colors={color}
        style={styles.statCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <Text style={styles.statIcon}>{icon}</Text>
          <Text style={styles.statNumber}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ActionButton = ({ title, icon, onPress, color = '#667eea' }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.actionButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.actionButtonIcon}>{icon}</Text>
        <Text style={styles.actionButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
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
          colors={['#667eea']}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Voici un aperçu de vos tickets
            </Text>
          </View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total"
              value={stats.totalTickets || 0}
              color={['#667eea', '#764ba2']}
              icon="📝"
              onPress={() => navigation.navigate('Tickets')}
            />
            <StatCard
              title="En attente"
              value={stats.pendingTickets || 0}
              color={['#FFA726', '#FF7043']}
              icon="⏳"
              onPress={() => navigation.navigate('Tickets')}
            />
            <StatCard
              title="En cours"
              value={stats.inProgressTickets || 0}
              color={['#42A5F5', '#1976D2']}
              icon="🔄"
              onPress={() => navigation.navigate('Tickets')}
            />
            <StatCard
              title="Résolus"
              value={stats.resolvedTickets || 0}
              color={['#66BB6A', '#388E3C']}
              icon="✅"
              onPress={() => navigation.navigate('Tickets')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Nouveau ticket"
              icon="➕"
              onPress={() => {
                // First, jump to the 'Tickets' tab
                navigation.dispatch(TabActions.jumpTo('Tickets'));
                // Then, navigate within the 'Tickets' stack to 'CreateTicket'
                // Use a small timeout to allow the tab transition to complete
                setTimeout(() => {
                  navigation.dispatch(StackActions.push('CreateTicket'));
                }, 10);
              }}
              color="#667eea"
            />
            <ActionButton
              title="Mes tickets"
              icon="📋"
              onPress={() => navigation.navigate('Tickets')}
              color="#42A5F5"
            />
            {isAdmin() && (
              <ActionButton
                title="Administration"
                icon="⚙️"
                onPress={() => navigation.navigate('Admin')}
                color="#FF5722"
              />
            )}
          </View>
        </View>

        {/* Help Card */}
        <Surface style={styles.helpCard} elevation={4}>
          <LinearGradient
            colors={['#F8F9FA', '#E9ECEF']}
            style={styles.helpCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.helpIcon}>💡</Text>
            <Text style={styles.helpTitle}>Besoin d'aide ?</Text>
            <Text style={styles.helpText}>
              Notre équipe de support est là pour vous aider. Créez un ticket 
              et nous vous répondrons rapidement !
            </Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => navigation.navigate('Tickets', { 
                screen: 'CreateTicket' 
              })}
            >
              <Text style={styles.helpButtonText}>Créer un ticket</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Surface>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCardContainer: {
    width: (width - 60) / 2,
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  helpCard: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  helpCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default HomeScreen;