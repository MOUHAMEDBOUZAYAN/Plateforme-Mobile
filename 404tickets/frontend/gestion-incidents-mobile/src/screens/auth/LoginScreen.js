// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('start fetching login');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      console.log('end fetching login');
      navigation.navigate('Home');
      // La navigation sera automatique grâce au AuthContext
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      
      // Vibrer en cas d'erreur si disponible
      if (Platform.OS === 'ios') {
        // Haptic feedback pour iOS
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>404 Tickets</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text.toLowerCase());
            setError('');
          }}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={!!error && !email}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          style={styles.input}
          mode="outlined"
          secureTextEntry={!showPassword}
          error={!!error && !password}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading || !email || !password}
          contentStyle={styles.buttonContent}
        >
          Se connecter
        </Button>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Pas encore de compte ? <Text style={styles.linkTextBold}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  form: {
    flex: 2,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContent: {
    padding: 8,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default LoginScreen;