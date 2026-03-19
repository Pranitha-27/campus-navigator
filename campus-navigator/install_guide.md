# 📦 Campus Navigator — New Features Installation Guide

## New Features Added
1. ✅ Turn-by-Turn Navigation UI
2. ✅ Voice Guidance (with settings screen)
3. ✅ Live Crowd Heatmap (Firestore realtime + REST fallback)
4. ✅ Social Navigation (friends, groups, invite codes)
5. ✅ AR Navigation (camera + compass overlay)

---

## Frontend — New Packages to Install

```bash
cd campus-navigator/frontend/campus-navigator

# Voice guidance
npx expo install expo-speech

# AR Navigation (camera + sensors)
npx expo install expo-camera
npx expo install expo-sensors

# Linear gradients (used across all new screens)
npx expo install expo-linear-gradient

# Slider for voice settings
npm install @react-native-community/slider

# Icon sets (already likely installed, verify)
npm install @expo/vector-icons

# Firebase client SDK (for realtime crowd + social)
npm install firebase
```

---

## Backend — New Packages to Install

```bash
cd campus-navigator/backend
# No new packages needed — uses existing Express + Firebase Admin SDK
npm install  # just to ensure all existing deps are present
```

---

## Firebase Client Config (Frontend)

Create `src/config/firebase.js` in the frontend:

```js
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
```

> Get these values from Firebase Console → Project Settings → Your Apps → Web App config.

---

## New Files to Add to Your Project

### Frontend (`frontend/campus-navigator/src/`)
```
screens/
  navigation/
    TurnByTurnScreen.js         ← Turn-by-turn UI
  ARNavigationScreen.js          ← AR camera overlay
  CrowdHeatmapScreen.js          ← Live crowd heatmap
  SocialNavigationScreen.js      ← Friends & groups
  settings/
    VoiceSettingsScreen.js        ← Voice profile settings
services/
  voiceGuidanceService.js         ← Voice guidance singleton
navigation/
  AppNavigator.js                 ← REPLACE existing one
screens/
  HomeScreen.js                   ← REPLACE existing one
config/
  firebase.js                     ← NEW Firebase client init
```

### Backend (`backend/src/`)
```
controllers/
  crowdController.js              ← Crowd CRUD
  socialController.js             ← Social location sharing & groups
routes/
  crowd.js                        ← /api/crowd/*
  social.js                       ← /api/social/*
server.js                         ← REPLACE with updated version
```

---

## Firestore Collections Needed

Run this once to seed demo data:
```
POST http://localhost:5000/api/crowd/seed
```

Collections the app uses:
| Collection       | Purpose                        |
|-----------------|--------------------------------|
| `locations`      | Campus rooms & buildings       |
| `crowd_data`     | Per-cell crowd density         |
| `user_locations` | Friend location sharing        |
| `nav_groups`     | Navigation groups              |

---

## app.json / expo permissions

Add to your `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        { "cameraPermission": "Allow Campus Navigator to use your camera for AR navigation." }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Used for AR navigation overlays.",
        "NSMotionUsageDescription": "Used for compass heading in AR navigation."
      }
    },
    "android": {
      "permissions": ["CAMERA", "RECORD_AUDIO"]
    }
  }
}
```

---

## Quick Test Flow

1. Start backend: `npm run dev` → runs on port 5000
2. Seed crowd data: `POST /api/crowd/seed`
3. Start frontend: `npx expo start`
4. On HomeScreen:
   - Tap **Navigate** → search for "IoT Lab" → tap **Navigate to** in LocationDetail
   - Tap **AR Navigation** for camera overlay
   - Tap **Crowd Map** to see live heatmap
   - Tap **Social Nav** to see friends/groups
   - Tap **Voice Settings** to configure voice

---

## How Turn-by-Turn integrates with existing LocationDetail

In your existing `LocationDetail.js`, add a "Navigate" button:

```js
// Add this button in LocationDetail.js
<TouchableOpacity
  onPress={() => navigation.navigate('TurnByTurn', {
    destination: location.name,
    startLocation: 'Current Location',
  })}
  style={navigateBtn}
>
  <Text>Navigate Here</Text>
</TouchableOpacity>

// And for AR:
<TouchableOpacity
  onPress={() => navigation.navigate('ARNavigation', {
    destination: location.name,
  })}
>
  <Text>AR Navigate</Text>
</TouchableOpacity>
```