// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { theme } from './src/theme';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/components/LoadingScreen';

// Composant pour la navigation conditionnelle
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Initialisation..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#2196F3' : 'transparent'}
        translucent={Platform.OS === 'android'}
      />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;