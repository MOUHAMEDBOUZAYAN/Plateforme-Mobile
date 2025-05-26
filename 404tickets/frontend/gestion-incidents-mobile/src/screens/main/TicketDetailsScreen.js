// src/screens/main/TicketDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, TextInput, FAB, Menu } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { StatusChip } from '../../components/StatusChip';
import { PriorityChip } from '../../components/PriorityChip';
import { ErrorMessage } from '../../components/ErrorMessage';
import LoadingScreen from '../../components/LoadingScreen';
import ticketService from '../../services/ticketService';
import { STATUS, STATUS_LABELS, PRIORITY_LABELS } from '../../constants';

const TicketDetailsScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setError('');
      const response = await ticketService.getTicket(ticketId);
      setTicket(response);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setError('Impossible de charger les détails du ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await ticketService.updateTicket(ticketId, { status: newStatus });
      await fetchTicketDetails();
      setMenuVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      await ticketService.addComment(ticketId, {
        content: comment.trim(),
      });
      setComment('');
      await fetchTicketDetails();
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = () => {
    Alert.alert(
      'Supprimer le ticket',
      'Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ticketService.deleteTicket(ticketId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le ticket');
            }
          },
        },
      ]
    );
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

  const canModifyTicket = () => {
    return isAdmin() || (ticket && ticket.author._id === user._id);
  };

  if (loading) {
    return <LoadingScreen message="Chargement du ticket..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={fetchTicketDetails}
      />
    );
  }

  if (!ticket) {
    return (
      <ErrorMessage 
        message="Ticket non trouvé" 
        onRetry={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête du ticket */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title}>{ticket.title}</Text>
              <View style={styles.chipContainer}>
                <StatusChip status={ticket.status} />
                <PriorityChip priority={ticket.priority} style={styles.priorityChip} />
              </View>
            </View>

            <Text style={styles.description}>{ticket.description}</Text>

            <Divider style={styles.divider} />

            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Créé par :</Text>
                <Text style={styles.metaValue}>
                  {ticket.author.name || ticket.author.email}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date de création :</Text>
                <Text style={styles.metaValue}>
                  {formatDate(ticket.createdAt)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Dernière mise à jour :</Text>
                <Text style={styles.metaValue}>
                  {formatDate(ticket.updatedAt)}
                </Text>
              </View>
              {ticket.assignedTo && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Assigné à :</Text>
                  <Text style={styles.metaValue}>
                    {ticket.assignedTo.name || ticket.assignedTo.email}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Section commentaires */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Commentaires</Text>
            
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment, index) => (
                <View key={index} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.author.name || comment.author.email}
                    </Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>
                    {comment.content}
                  </Text>
                  {index < ticket.comments.length - 1 && (
                    <Divider style={styles.commentDivider} />
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
            )}
          </Card.Content>
        </Card>

        {/* Ajouter un commentaire */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Ajouter un commentaire</Text>
            <TextInput
              label="Votre commentaire"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.commentInput}
              placeholder="Tapez votre commentaire ici..."
            />
            <Button
              mode="contained"
              onPress={handleCommentSubmit}
              loading={submitting}
              disabled={submitting || !comment.trim()}
              style={styles.commentButton}
            >
              Publier le commentaire
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Actions pour admin */}
      {isAdmin() && (
        <View style={styles.fabContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <FAB
                style={styles.fab}
                icon="cog"
                onPress={() => setMenuVisible(true)}
                label="Actions"
              />
            }
          >
            <Menu.Item
              onPress={() => handleStatusChange(STATUS.PENDING)}
              title={STATUS_LABELS[STATUS.PENDING]}
              leadingIcon="clock-outline"
            />
            <Menu.Item
              onPress={() => handleStatusChange(STATUS.IN_PROGRESS)}
              title={STATUS_LABELS[STATUS.IN_PROGRESS]}
              leadingIcon="progress-wrench"
            />
            <Menu.Item
              onPress={() => handleStatusChange(STATUS.RESOLVED)}
              title={STATUS_LABELS[STATUS.RESOLVED]}
              leadingIcon="check-circle-outline"
            />
            <Menu.Item
              onPress={() => handleStatusChange(STATUS.CLOSED)}
              title={STATUS_LABELS[STATUS.CLOSED]}
              leadingIcon="close-circle-outline"
            />
            <Divider />
            {canModifyTicket() && (
              <Menu.Item
                onPress={handleDeleteTicket}
                title="Supprimer"
                leadingIcon="delete"
                titleStyle={{ color: '#B00020' }}
              />
            )}
          </Menu>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  priorityChip: {
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
  },
  metaInfo: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2196F3',
  },
  comment: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    color: '#666',
    lineHeight: 20,
  },
  commentDivider: {
    marginTop: 16,
  },
  noComments: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  commentInput: {
    marginBottom: 16,
  },
  commentButton: {
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    backgroundColor: '#FF5722',
  },
});

export default TicketDetailsScreen;