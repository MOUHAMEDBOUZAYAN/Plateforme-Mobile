// src/screens/main/ProfileScreen.js
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { TextInput, Button, Text, Avatar, Divider, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({ name, email });
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({ currentPassword, newPassword });
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const getInitials = (name, email) => {
    if (name && name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    if (email && email.length >= 2) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const ProfileSection = ({ title, children, icon }) => (
    <Surface style={styles.section} elevation={2}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Surface>
  );

  const StyledInput = ({ label, value, onChangeText, ...props }) => (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      mode="outlined"
      theme={{
        colors: {
          primary: '#667eea',
          outline: '#E0E0E0',
        },
      }}
      {...props}
    />
  );

  const StyledButton = ({ onPress, children, variant = 'primary', ...props }) => (
    <TouchableOpacity onPress={onPress} style={styles.buttonWrapper}>
      <LinearGradient
        colors={
          variant === 'primary' 
            ? ['#667eea', '#764ba2'] 
            : variant === 'danger'
            ? ['#FF6B6B', '#EE5A52']
            : ['#F8F9FA', '#E9ECEF']
        }
        style={[
          styles.gradientButton,
          variant === 'outlined' && styles.outlinedButton
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[
          styles.buttonText,
          variant === 'outlined' && styles.outlinedButtonText
        ]}>
          {children}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with Avatar */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Avatar.Text 
                size={100} 
                label={getInitials(name, email)} 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Text style={styles.editAvatarText}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{name || email}</Text>
            <View style={styles.roleContainer}>
              <LinearGradient
                colors={user?.role === 'admin' ? ['#FF6B6B', '#EE5A52'] : ['#4ECDC4', '#44A08D']}
                style={styles.roleBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.roleText}>
                  {user?.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Information */}
        <View style={styles.content}>
          <ProfileSection title="Informations personnelles" icon="👤">
            <StyledInput
              label="Nom complet"
              value={name}
              onChangeText={setName}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <StyledInput
              label="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" />}
            />
            <StyledButton
              onPress={handleUpdateProfile}
              variant="primary"
            >
              Mettre à jour le profil
            </StyledButton>
          </ProfileSection>

          {/* Password Change */}
          <ProfileSection title="Sécurité" icon="🔒">
            <StyledInput
              label="Mot de passe actuel"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              left={<TextInput.Icon icon="lock-outline" />}
            />
            <StyledInput
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              left={<TextInput.Icon icon="lock-plus-outline" />}
            />
            <StyledInput
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              left={<TextInput.Icon icon="lock-check-outline" />}
            />
            <StyledButton
              onPress={handleChangePassword}
              variant="primary"
            >
              Changer le mot de passe
            </StyledButton>
          </ProfileSection>

          {/* Account Stats */}
          <ProfileSection title="Statistiques du compte" icon="📊">
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Tickets créés</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Tickets résolus</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>Taux de résolution</Text>
              </View>
            </View>
          </ProfileSection>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Mes tickets</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>🔔</Text>
              <Text style={styles.actionText}>Notifications</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>❓</Text>
              <Text style={styles.actionText}>Aide et support</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <StyledButton
              onPress={handleLogout}
              variant="danger"
            >
              🚪 Se déconnecter
            </StyledButton>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>404 Tickets v1.0</Text>
            <Text style={styles.footerSubtext}>Dernière connexion: Aujourd'hui</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editAvatarText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roleContainer: {
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    marginTop: -20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlinedButtonText: {
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#343A40',
  },
  actionArrow: {
    fontSize: 16,
    color: '#6C757D',
  },
  logoutContainer: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
  },
});

export default ProfileScreen;