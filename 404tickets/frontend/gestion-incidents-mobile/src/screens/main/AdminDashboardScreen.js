// src/screens/main/AdminDashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, DataTable, Searchbar, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusChip } from '../../components/ErrorMessage';
import ticketService from '../../services/ticketService';
import { TICKET_STATUS, STATUS_LABELS } from '../../constants';

const AdminDashboardScreen = () => {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [ticketsData, statsData, usersData] = await Promise.all([
        ticketService.getAllTickets(),
        ticketService.getStats(),
        ticketService.getAllUsers(),
      ]);
      
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setStats(statsData || {});
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Impossible de charger les données d\'administration');
      setTickets([]);
      setStats({});
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await ticketService.updateUserRole(userId, newRole);
      await fetchData(); // Recharger les données
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Erreur', 'Impossible de modifier le rôle');
    }
  };

  const handleTicketStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      await fetchData(); // Recharger les données
    } catch (error) {
      console.error('Error updating ticket status:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.author?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Chargement des données d'administration...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  const tabOptions = [
    { value: 'overview', label: 'Vue d\'ensemble' },
    { value: 'tickets', label: 'Tickets' },
    { value: 'users', label: 'Utilisateurs' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF5722']}
          />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Tableau de bord administrateur</Text>
          <Text style={styles.subtitle}>Gérez les tickets et les utilisateurs</Text>
        </View>

        {/* Onglets */}
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={tabOptions}
          style={styles.tabs}
        />

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <Text style={styles.statNumber}>{stats.totalTickets || 0}</Text>
                  <Text style={styles.statLabel}>Total Tickets</Text>
                </Card.Content>
              </Card>

              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <Text style={styles.statNumber}>{users.length}</Text>
                  <Text style={styles.statLabel}>Utilisateurs</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: '#FFC107' }]}>
                <Card.Content style={styles.statCardContent}>
                  <Text style={[styles.statNumber, styles.whiteText]}>
                    {stats.pendingTickets || 0}
                  </Text>
                  <Text style={[styles.statLabel, styles.whiteText]}>En attente</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
                <Card.Content style={styles.statCardContent}>
                  <Text style={[styles.statNumber, styles.whiteText]}>
                    {stats.inProgressTickets || 0}
                  </Text>
                  <Text style={[styles.statLabel, styles.whiteText]}>En cours</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Actions rapides */}
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="ticket"
                onPress={() => setActiveTab('tickets')}
                style={styles.actionButton}
              >
                Gérer les tickets
              </Button>
              <Button
                mode="contained"
                icon="account-group"
                onPress={() => setActiveTab('users')}
                style={styles.actionButton}
              >
                Gérer les utilisateurs
              </Button>
            </View>
          </View>
        )}

        {/* Gestion des tickets */}
        {activeTab === 'tickets' && (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Rechercher des tickets..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            <Card style={styles.tableCard}>
              <Card.Content>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title style={styles.titleColumn}>Titre</DataTable.Title>
                    <DataTable.Title style={styles.statusColumn}>Statut</DataTable.Title>
                    <DataTable.Title style={styles.authorColumn}>Auteur</DataTable.Title>
                  </DataTable.Header>

                  {filteredTickets.slice(0, 10).map(ticket => (
                    <DataTable.Row key={ticket._id}>
                      <DataTable.Cell style={styles.titleColumn}>
                        <Text numberOfLines={2} style={styles.ticketTitle}>
                          {ticket.title}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.statusColumn}>
                        <StatusChip status={ticket.status} />
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.authorColumn}>
                        <Text numberOfLines={1}>
                          {ticket.author.email}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>

                {filteredTickets.length > 10 && (
                  <Text style={styles.moreInfo}>
                    ... et {filteredTickets.length - 10} autres tickets
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Gestion des utilisateurs */}
        {activeTab === 'users' && (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Rechercher des utilisateurs..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            <Card style={styles.tableCard}>
              <Card.Content>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title style={styles.emailColumn}>Email</DataTable.Title>
                    <DataTable.Title style={styles.roleColumn}>Rôle</DataTable.Title>
                    <DataTable.Title style={styles.actionColumn}>Action</DataTable.Title>
                  </DataTable.Header>

                  {filteredUsers.map(user => (
                    <DataTable.Row key={user._id}>
                      <DataTable.Cell style={styles.emailColumn}>
                        <View>
                          <Text style={styles.userEmail}>{user.email}</Text>
                          {user.name && (
                            <Text style={styles.userName}>{user.name}</Text>
                          )}
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.roleColumn}>
                        <Text style={[
                          styles.roleText,
                          user.role === 'admin' && styles.adminRole
                        ]}>
                          {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.actionColumn}>
                        <Button
                          mode="text"
                          compact
                          onPress={() => handleRoleChange(
                            user._id, 
                            user.role === 'admin' ? 'user' : 'admin'
                          )}
                          textColor="#FF5722"
                        >
                          {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                        </Button>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  tabs: {
    margin: 16,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  whiteText: {
    color: '#fff',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  tableCard: {
    elevation: 2,
  },
  titleColumn: {
    flex: 3,
  },
  statusColumn: {
    flex: 2,
  },
  authorColumn: {
    flex: 2,
  },
  emailColumn: {
    flex: 3,
  },
  roleColumn: {
    flex: 2,
  },
  actionColumn: {
    flex: 2,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 12,
    color: '#666',
  },
  roleText: {
    fontSize: 14,
  },
  adminRole: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  moreInfo: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
});

export default AdminDashboardScreen;