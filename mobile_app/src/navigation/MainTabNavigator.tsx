import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TestsScreen from '../screens/TestsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#1A1F3C' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1A1F3C' }
    }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
