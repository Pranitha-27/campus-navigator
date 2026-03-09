import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
<<<<<<< HEAD

=======
>>>>>>> 6391fe06a9906ac2a0d7ff969ca28e6be1a3ccb7
// 1. IMPORT your detail screen here (verify the exact file path)
import LocationDetailScreen from '../screens/navigation/LocationDetailScreen'; 

// ADD these two imports after the LocationDetailScreen import
import SelectDestination from '../screens/navigation/SelectDestination';
import PathResult from '../screens/navigation/PathResult';

import QRScannerScreen from '../screens/navigation/QRScannerScreen'; 
import BuildingMapScreen from '../screens/navigation/BuildingMapScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NavigationHome" component={NavigationHomeScreen} />
<<<<<<< HEAD
        
=======
>>>>>>> 6391fe06a9906ac2a0d7ff969ca28e6be1a3ccb7
        
        {/* 2. REGISTER the screen with the name 'LocationDetail' */}
        <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />

        <Stack.Screen name="SelectDestination" component={SelectDestination} />
        <Stack.Screen name="PathResult" component={PathResult} />

        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="BuildingMap" component={BuildingMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}