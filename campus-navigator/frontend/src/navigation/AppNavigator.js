import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
import BookingHomeScreen from '../screens/booking/BookingHomeScreen';
// 1. IMPORT your detail screen here (verify the exact file path)
import LocationDetailScreen from '../screens/navigation/LocationDetailScreen'; 

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NavigationHome" component={NavigationHomeScreen} />
        <Stack.Screen name="BookingHome" component={BookingHomeScreen} />
        
        {/* 2. REGISTER the screen with the name 'LocationDetail' */}
        <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}