// src/screens/main/TicketsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, FAB, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { StatusChip } from '../../components/StatusChip';
import { PriorityChip } from '../../components/PriorityChip';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import ticketService from '../../services/ticketService';
import { STATUS, STATUS_LABELS } from '../../constants';

const TicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const { user, isAdmin } = useAuth();

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
      const data = response.tickets; // Access the 'tickets' array from the response object
      
      // Ensure data is an array before setting state
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
      // Ensure tickets state is an array even on error
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
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.chipContainer}>
              <StatusChip status={item.status} style={styles.statusChip} />
              <PriorityChip priority={item.priority} style={styles.priorityChip} />
            </View>
          </View>
          
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {item.author?.name || item.author?.email}
              </Text>
              <Text style={styles.date}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
      {/* Barre de recherche */}
      <Searchbar
        placeholder="Rechercher des tickets..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        icon="magnify"
        clearIcon="close"
      />

      {/* Filtres de statut */}
      <SegmentedButtons
        value={statusFilter}
        onValueChange={setStatusFilter}
        buttons={statusOptions}
        style={styles.filterButtons}
      />

      {/* Liste des tickets */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          title="Aucun ticket trouvé"
          description={
            searchQuery || statusFilter !== 'all'
              ? "Aucun ticket ne correspond à vos critères de recherche"
              : "Vous n'avez pas encore créé de ticket"
          }
          iconName="ticket-outline"
          actionText={searchQuery || statusFilter !== 'all' ? undefined : "Créer un ticket"}
          onAction={searchQuery || statusFilter !== 'all' ? undefined : () => navigation.navigate('Tickets', { screen: 'CreateTicket' })}
        />
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicket}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bouton flottant pour créer un ticket */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Tickets', { screen: 'CreateTicket' })}
        label="Nouveau"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    color: '#333',
  },
  chipContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusChip: {
    minWidth: 80,
  },
  priorityChip: {
    minWidth: 80,
  },
  description: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default TicketsScreen;