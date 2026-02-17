
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
import BookingHomeScreen from '../screens/booking/BookingHomeScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NavigationHome" component={NavigationHomeScreen} />
        <Stack.Screen name="BookingHome" component={BookingHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
