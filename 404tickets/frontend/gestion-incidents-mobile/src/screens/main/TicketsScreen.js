// src/screens/main/TicketsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Animated,
  Dimensions
} from 'react-native';
import { Text, Card, FAB, Searchbar, Chip, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import ticketService from '../../services/ticketService';
import { STATUS, STATUS_LABELS } from '../../constants';

const { width } = Dimensions.get('window');

const TicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user, isAdmin } = useAuth();

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Recharger les données quand l'écran est focalisé
  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const fetchTickets = async () => {
    try {
      setError('');
      const response = await ticketService.getAllTickets();
      const data = response.tickets;
      
      if (Array.isArray(data)) {
        setTickets(data);
        setFilteredTickets(data);
      } else {
        console.error('Received non-array data from API:', data);
        setTickets([]);
        setFilteredTickets([]);
        setError('Erreur lors du chargement des tickets: Format de données invalide');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
      setFilteredTickets([]);
      setError('Impossible de charger les tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, []);

  // Filtrer les tickets selon la recherche et le statut
  useEffect(() => {
    let filtered = tickets;

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.author?.name?.toLowerCase().includes(query) ||
        ticket.author?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter]);

  const handleRetry = () => {
    setLoading(true);
    fetchTickets();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return ['#FFA726', '#FF7043'];
      case 'in_progress': return ['#42A5F5', '#1976D2'];
      case 'resolved': return ['#66BB6A', '#388E3C'];
      case 'closed': return ['#78909C', '#546E7A'];
      default: return ['#9E9E9E', '#757575'];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const StatusChip = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <LinearGradient
        colors={colors}
        style={styles.statusChip}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.statusChipText}>
          {STATUS_LABELS[status] || status}
        </Text>
      </LinearGradient>
    );
  };

  const PriorityDot = ({ priority }) => (
    <View 
      style={[
        styles.priorityDot, 
        { backgroundColor: getPriorityColor(priority) }
      ]} 
    />
  );

  const FilterChip = ({ label, value, isSelected, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Chip
        selected={isSelected}
        onPress={onPress}
        style={[
          styles.filterChip,
          isSelected && styles.selectedFilterChip
        ]}
        textStyle={[
          styles.filterChipText,
          isSelected && styles.selectedFilterChipText
        ]}
        selectedColor="#667eea"
      >
        {label}
      </Chip>
    </TouchableOpacity>
  );

  const renderTicket = ({ item, index }) => (
    <Animated.View
      style={[
        styles.ticketContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
        activeOpacity={0.7}
      >
        <Surface style={styles.ticketCard} elevation={2}>
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.ticketCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTitleContainer}>
                <PriorityDot priority={item.priority} />
                <Text style={styles.ticketTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <StatusChip status={item.status} />
            </View>
            
            <Text numberOfLines={2} style={styles.ticketDescription}>
              {item.description}
            </Text>
            
            <View style={styles.ticketFooter}>
              <View style={styles.authorInfo}>
                {item.author ? (
                  <Text style={styles.authorName}>
                    👤 {item.author.name || item.author.email}
                  </Text>
                ) : (
                  <Text style={styles.authorName}>👤 Auteur inconnu</Text>
                )}
                <Text style={styles.ticketDate}>
                  🕒 {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return <LoadingScreen message="Chargement des tickets..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  const statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: STATUS.PENDING, label: STATUS_LABELS[STATUS.PENDING] },
    { value: STATUS.IN_PROGRESS, label: STATUS_LABELS[STATUS.IN_PROGRESS] },
    { value: STATUS.RESOLVED, label: STATUS_LABELS[STATUS.RESOLVED] },
    { value: STATUS.CLOSED, label: STATUS_LABELS[STATUS.CLOSED] },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>📋 Mes Tickets</Text>
        <Text style={styles.headerSubtitle}>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="🔍 Rechercher des tickets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />

        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statusOptions}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                value={item.value}
                isSelected={statusFilter === item.value}
                onPress={() => setStatusFilter(item.value)}
              />
            )}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      </View>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          title="Aucun ticket trouvé"
          description={
            searchQuery || statusFilter !== 'all'
              ? "Aucun ticket ne correspond à vos critères"
              : "Vous n'avez pas encore créé de ticket"
          }
          iconName="ticket-outline"
          actionText={searchQuery || statusFilter !== 'all' ? undefined : "Créer un ticket"}
          onAction={searchQuery || statusFilter !== 'all' ? undefined : () => navigation.navigate('CreateTicket')}
        />
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicket}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.ticketsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667eea']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateTicket')}
        label="Nouveau"
        color="#FFFFFF"
        customSize={56}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginTop: -12,
    marginBottom: 16,
  },
  searchbar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    fontSize: 16,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersList: {
    paddingHorizontal: 4,
  },
  filterChip: {
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFilterChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    color: '#666666',
    fontSize: 14,
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ticketsList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  ticketContainer: {
    marginBottom: 16,
  },
  ticketCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketCardGradient: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    lineHeight: 24,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  statusChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketDescription: {
    fontSize: 16,
    color: '#6C757D',
    lineHeight: 22,
    marginBottom: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    fontWeight: '500',
  },
  ticketDate: {
    fontSize: 13,
    color: '#868E96',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    borderRadius: 28,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default TicketsScreen;