import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// frontend/src/screens/  <-- directly here
import HomeScreen from '../screens/HomeScreen';
<<<<<<< HEAD
import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
// 1. IMPORT your detail screen here (verify the exact file path)
import LocationDetailScreen from '../screens/navigation/LocationDetailScreen'; 

// ADD these two imports after the LocationDetailScreen import
import SelectDestination from '../screens/navigation/SelectDestination';
import PathResult from '../screens/navigation/PathResult';

import QRScannerScreen from '../screens/navigation/QRScannerScreen'; 
import BuildingMapScreen from '../screens/navigation/BuildingMapScreen';

import LiveNavigationScreen from '../screens/navigation/LiveNavigationScreen';

const Stack = createStackNavigator();
=======
import ARNavigationScreen from '../screens/ARNavigationScreen';
import CrowdHeatmapScreen from '../screens/CrowdHeatmapScreen';
import SocialNavigationScreen from '../screens/SocialNavigationScreen';
import VoiceSettingsScreen from '../screens/VoiceSettingsScreen';

// frontend/src/screens/navigation/  <-- inside navigation subfolder
import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
import LocationDetailScreen from '../screens/navigation/LocationDetailScreen';
import TurnByTurnScreen from '../screens/navigation/TurnByTurnScreen';

const Stack = createNativeStackNavigator();
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0A0E1A' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="NavigationHome" component={NavigationHomeScreen} />
<<<<<<< HEAD
        
        {/* 2. REGISTER the screen with the name 'LocationDetail' */}
        <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />

        <Stack.Screen name="SelectDestination" component={SelectDestination} />
        <Stack.Screen name="PathResult" component={PathResult} />

        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="BuildingMap" component={BuildingMapScreen} />

        <Stack.Screen name="LiveNavigation" component={LiveNavigationScreen} />
=======
        <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
        <Stack.Screen
          name="TurnByTurn"
          component={TurnByTurnScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ARNavigation"
          component={ARNavigationScreen}
          options={{ animation: 'fade' }}
        />

        <Stack.Screen name="CrowdHeatmap" component={CrowdHeatmapScreen} />

        <Stack.Screen name="SocialNavigation" component={SocialNavigationScreen} />

        <Stack.Screen
          name="VoiceSettings"
          component={VoiceSettingsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a
      </Stack.Navigator>
    </NavigationContainer>
  );
}