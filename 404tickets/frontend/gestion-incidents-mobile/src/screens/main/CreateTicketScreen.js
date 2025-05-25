// src/screens/main/CreateTicketScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import ticketService from '../../services/ticketService';
import { TICKET_PRIORITY, PRIORITY_LABELS } from '../../constants';

const CreateTicketScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(TICKET_PRIORITY.MEDIUM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (title.length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      
      await ticketService.createTicket(ticketData);
      
      Alert.alert(
        'Succès',
        'Votre ticket a été créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Create ticket error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          'Une erreur est survenue lors de la création du ticket';
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    {
      value: TICKET_PRIORITY.LOW,
      label: PRIORITY_LABELS[TICKET_PRIORITY.LOW],
    },
    {
      value: TICKET_PRIORITY.MEDIUM,
      label: PRIORITY_LABELS[TICKET_PRIORITY.MEDIUM],
    },
    {
      value: TICKET_PRIORITY.HIGH,
      label: PRIORITY_LABELS[TICKET_PRIORITY.HIGH],
    },
    {
      value: TICKET_PRIORITY.CRITICAL,
      label: PRIORITY_LABELS[TICKET_PRIORITY.CRITICAL],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer un nouveau ticket</Text>
        <Text style={styles.subtitle}>
          Décrivez votre problème technique en détail
        </Text>

        <TextInput
          label="Titre du ticket *"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) {
              setErrors({ ...errors, title: null });
            }
          }}
          style={styles.input}
          mode="outlined"
          error={!!errors.title}
          maxLength={100}
          placeholder="Ex: Problème de connexion réseau"
        />
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>

        <TextInput
          label="Description détaillée *"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (errors.description) {
              setErrors({ ...errors, description: null });
            }
          }}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={6}
          error={!!errors.description}
          maxLength={1000}
          placeholder="Décrivez votre problème en détail : quand cela se produit-il, quelles sont les étapes pour le reproduire, etc."
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description}
        </HelperText>
        <HelperText type="info" visible={true}>
          {description.length}/1000 caractères
        </HelperText>

        <Text style={styles.label}>Priorité</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={priorityOptions}
          style={styles.priorityButtons}
        />
        <HelperText type="info" visible={true}>
          Sélectionnez la priorité selon l'urgence de votre problème
        </HelperText>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            Annuler
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            loading={loading}
            disabled={loading || !title.trim() || !description.trim()}
          >
            Créer le ticket
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    marginTop: 16,
    color: '#333',
    fontWeight: '500',
  },
  priorityButtons: {
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: '#666',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
});

export default CreateTicketScreen;