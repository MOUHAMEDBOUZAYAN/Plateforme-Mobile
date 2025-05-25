// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import TicketsScreen from '../screens/main/TicketsScreen';
import CreateTicketScreen from '../screens/main/CreateTicketScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TicketDetailsScreen from '../screens/main/TicketDetailsScreen';
import AdminDashboardScreen from '../screens/main/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack pour les tickets
const TicketStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TicketsList" 
        component={TicketsScreen}
        options={{ title: 'Mes Tickets' }}
      />
      <Stack.Screen 
        name="TicketDetails" 
        component={TicketDetailsScreen}
        options={{ title: 'Détails du Ticket' }}
      />
      <Stack.Screen 
        name="CreateTicket" 
        component={CreateTicketScreen}
        options={{ title: 'Nouveau Ticket' }}
      />
    </Stack.Navigator>
  );
};

// Stack pour l'accueil
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: '404 Tickets' }}
      />
    </Stack.Navigator>
  );
};

// Stack pour le profil
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Stack.Navigator>
  );
};

// Stack pour l'admin
const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF5722',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AdminMain" 
        component={AdminDashboardScreen}
        options={{ title: 'Administration' }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tickets':
              iconName = focused ? 'ticket' : 'ticket-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'Admin':
              iconName = focused ? 'shield-account' : 'shield-account-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: '#000',
          shadowOffset: { height: -2, width: 0 },
          backgroundColor: '#fff',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Tickets" 
        component={TicketStack}
        options={{ title: 'Tickets' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profil' }}
      />
      {isAdmin() && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{ 
            title: 'Admin',
            tabBarActiveTintColor: '#FF5722',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;