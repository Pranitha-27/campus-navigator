import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// src/screens/
import HomeScreen            from '../screens/HomeScreen';
import ARNavigationScreen    from '../screens/ARNavigationScreen';
import CrowdHeatmapScreen    from '../screens/CrowdHeatmapScreen';
import SocialNavigationScreen from '../screens/SocialNavigationScreen';
import VoiceSettingsScreen   from '../screens/VoiceSettingsScreen';

// src/screens/navigation/
import NavigationHomeScreen  from '../screens/navigation/NavigationHomeScreen';
import LocationDetailScreen  from '../screens/navigation/LocationDetailScreen';
import TurnByTurnScreen      from '../screens/navigation/TurnByTurnScreen';
import QRScannerScreen       from '../screens/navigation/QRScannerScreen';
import BuildingMapScreen     from '../screens/navigation/BuildingMapScreen';
import LiveNavigationScreen  from '../screens/navigation/LiveNavigationScreen';
import PathResult            from '../screens/navigation/PathResult';
import SelectDestination     from '../screens/navigation/SelectDestination';

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
        {/* Main */}
        <Stack.Screen name="Home"             component={HomeScreen} />

        {/* Navigation flow */}
        <Stack.Screen name="NavigationHome"   component={NavigationHomeScreen} />
        <Stack.Screen name="LocationDetail"   component={LocationDetailScreen} />
        <Stack.Screen name="SelectDestination" component={SelectDestination} />
        <Stack.Screen name="PathResult"       component={PathResult} />
        <Stack.Screen
          name="TurnByTurn"
          component={TurnByTurnScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="LiveNavigation"
          component={LiveNavigationScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* QR Scanner — separate from browse */}
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* Building / Floor map */}
        <Stack.Screen name="BuildingMap"      component={BuildingMapScreen} />

        {/* AR */}
        <Stack.Screen
          name="ARNavigation"
          component={ARNavigationScreen}
          options={{ animation: 'fade' }}
        />

        {/* Live data */}
        <Stack.Screen name="CrowdHeatmap"     component={CrowdHeatmapScreen} />

        {/* Social */}
        <Stack.Screen name="SocialNavigation" component={SocialNavigationScreen} />

        {/* Settings */}
        <Stack.Screen
          name="VoiceSettings"
          component={VoiceSettingsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}