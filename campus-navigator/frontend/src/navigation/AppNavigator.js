import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ARNavigationScreen from '../screens/ARNavigationScreen';
import CrowdHeatmapScreen from '../screens/CrowdHeatmapScreen';
import SocialNavigationScreen from '../screens/SocialNavigationScreen';
import VoiceSettingsScreen from '../screens/VoiceSettingsScreen';

import NavigationHomeScreen from '../screens/navigation/NavigationHomeScreen';
import LocationDetailScreen from '../screens/navigation/LocationDetailScreen';
import TurnByTurnScreen from '../screens/navigation/TurnByTurnScreen';

const Stack = createNativeStackNavigator();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}