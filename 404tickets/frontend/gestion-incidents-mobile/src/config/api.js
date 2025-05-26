// src/config/api.js
import { Platform } from 'react-native';

// Configuration des URLs selon l'environnement
const API_CONFIGS = {
  development: {
    android: 'http://192.168.20.243:5000/api',
    ios: 'http://192.168.20.243:5000/api',
    // Remplacez YOUR_LOCAL_IP par votre IP locale (ex: 192.168.1.100)
    physical: 'http://192.168.20.243:5000/api',
  },
  production: {
    // Remplacez par l'URL de votre API en production
    default: 'https://your-app-name.herokuapp.com/api',
  }
};

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return API_CONFIGS.development.android;
    } else if (Platform.OS === 'ios') {
      return API_CONFIGS.development.ios;
    }
    return API_CONFIGS.development.android;
  } else {
    return API_CONFIGS.production.default;
  }
};

const API_URL = getApiUrl();

if (__DEV__) {
  console.log('🌐 API Configuration:');
  console.log('Platform:', Platform.OS);
  console.log('API URL:', API_URL);
}

export default API_URL;