// src/theme/index.js
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Couleurs principales
    primary: '#2196F3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#BBDEFB',
    onPrimaryContainer: '#0D47A1',
    
    // Couleurs secondaires
    secondary: '#03DAC6',
    onSecondary: '#000000',
    secondaryContainer: '#B2DFDB',
    onSecondaryContainer: '#004D40',
    
    // Couleurs d'accent
    tertiary: '#FF5722',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFCCBC',
    onTertiaryContainer: '#BF360C',
    
    // Couleurs d'erreur
    error: '#B00020',
    onError: '#FFFFFF',
    errorContainer: '#FFCDD2',
    onErrorContainer: '#7F0000',
    
    // Couleurs de fond
    background: '#F5F5F5',
    onBackground: '#1C1B1F',
    surface: '#FFFFFF',
    onSurface: '#1C1B1F',
    surfaceVariant: '#F3F3F3',
    onSurfaceVariant: '#49454F',
    
    // Couleurs d'outline
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    
    // Couleurs spéciales
    shadow: '#000000',
    scrim: '#000000',
    
    // Couleurs inversées
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#90CAF9',
    
    // Couleurs de statut personnalisées
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    
    // Couleurs de priorité
    priorityLow: '#4CAF50',
    priorityMedium: '#FFC107',
    priorityHigh: '#FF9800',
    priorityCritical: '#F44336',
    
    // Couleurs de statut des tickets
    statusPending: '#FFC107',
    statusInProgress: '#2196F3',
    statusResolved: '#4CAF50',
    statusClosed: '#9E9E9E',
    
    // Couleurs d'état
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF4081',
  },
  
  // Configuration des coins arrondis
  roundness: 8,
  
  // Configuration des animations
  animation: {
    scale: 1.0,
  },
  
  // Configuration des polices personnalisées
  fonts: {
    ...DefaultTheme.fonts,
    // Vous pouvez personnaliser les polices ici
    displayLarge: {
      ...DefaultTheme.fonts.displayLarge,
      fontFamily: 'System', // ou une police personnalisée
    },
    displayMedium: {
      ...DefaultTheme.fonts.displayMedium,
      fontFamily: 'System',
    },
    displaySmall: {
      ...DefaultTheme.fonts.displaySmall,
      fontFamily: 'System',
    },
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontFamily: 'System',
    },
    headlineMedium: {
      ...DefaultTheme.fonts.headlineMedium,
      fontFamily: 'System',
    },
    headlineSmall: {
      ...DefaultTheme.fonts.headlineSmall,
      fontFamily: 'System',
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontFamily: 'System',
      fontWeight: '600',
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontFamily: 'System',
      fontWeight: '500',
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontFamily: 'System',
      fontWeight: '500',
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontFamily: 'System',
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontFamily: 'System',
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontFamily: 'System',
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontFamily: 'System',
      fontWeight: '500',
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontFamily: 'System',
      fontWeight: '500',
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontFamily: 'System',
      fontWeight: '500',
    },
  },
};

// Thème sombre (optionnel)
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#90CAF9',
    onPrimary: '#0D47A1',
    background: '#121212',
    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    outline: '#938F99',
    outlineVariant: '#49454F',
  },
};

// Styles communs
export const commonStyles = {
  // Ombres
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  
  // Espacements
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Tailles de police
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  
  // Conteneurs
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  
  // Boutons
  button: {
    borderRadius: theme.roundness,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  
  // Champs de texte
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
  },
};