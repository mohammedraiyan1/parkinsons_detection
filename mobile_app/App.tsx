import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator onLogin={() => setIsAuthenticated(true)} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
