# **Campus Navigator - Smart Indoor Navigation System**

---

## 📱 **About**

Campus Navigator is an intelligent indoor navigation system designed for college campuses. Find any lab, classroom, cafeteria, or location on campus with precision pathfinding, real-time search, and QR code integration.

### **Why Campus Navigator?**

- 🗺️ **Never get lost** - Navigate through complex campus buildings effortlessly
- ⚡ **Real-time search** - Find any location instantly
- 🎯 **Smart pathfinding** - Get the shortest route to your destination
- 📱 **QR Navigation** - Scan codes to discover and navigate to locations
- 🏫 **Multi-building support** - Works across your entire campus

---

## ✨ **Features**

### **Core Navigation**
- 🧭 **Indoor Navigation** - Turn-by-turn directions inside buildings
- 🔍 **Smart Search** - Find labs, classrooms, cafeterias, and more
- 📍 **Location Details** - View complete information about any campus location
- 🗺️ **Interactive Maps** - Visual floor plans and building layouts
- 🎯 **Pathfinding Algorithm** - Optimized routes considering stairs, elevators, and corridors

### **Smart Features**
- 📱 **QR Code Integration** - Instant navigation from scanned codes
- 🏢 **Multi-floor Navigation** - Seamless routing across different floors
- 🔖 **Location Tags** - Filter by lab, classroom, landmark, etc.
- ♿ **Accessibility Support** - Wheelchair-friendly route options
- 📊 **Building Information** - Floor numbers, room numbers, descriptions

### **Coming Soon** 🚀
- 🥽 **AR Navigation** - Augmented reality directions
- 🔥 **Live Crowd Heatmap** - Real-time occupancy tracking
- 📅 **Class Schedule Integration** - Auto-navigation to your next class
- 🚨 **Emergency SOS** - One-tap emergency alerts
- 👥 **Social Navigation** - See where your friends are
- 🗣️ **Voice Guidance** - Hands-free navigation
- 🎮 **Gamification** - Campus exploration challenges

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **React Navigation** - Screen navigation and routing
- **Axios** - API communication

### **Backend**
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Admin SDK** - Backend Firebase integration

### **Tools & Services**
- **Git** - Version control
- **npm** - Package management
- **Nodemon** - Development auto-reload
- **Dotenv** - Environment configuration

---

## 📦 **Installation**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Android Studio / Xcode (for emulators)

### **1. Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/campus-navigator.git
cd campus-navigator
```

### **2. Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure `.env` file:**
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

**Add Firebase Service Account:**
1. Go to Firebase Console: https://console.firebase.google.com
2. Project Settings → Service Accounts
3. Generate new private key
4. Save as `serviceAccountKey.json` in `backend/` folder

**Start backend server:**
```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

### **3. Frontend Setup**

```bash
# Navigate to frontend folder (open new terminal)
cd frontend

# Install dependencies
npm install
```

**Configure API URL:**

Open `frontend/src/services/navigationService.js` and update:
```javascript
const API_URL = 'http://YOUR_IP_ADDRESS:5000/api';
// For Android emulator: http://10.0.2.2:5000/api
// For physical device: http://192.168.x.x:5000/api
```

**Start Expo development server:**
```bash
npx expo start
```

Press `a` for Android or `i` for iOS

---

## 🔥 **Firebase Setup**

### **1. Create Firebase Project**
1. Go to Firebase Console: https://console.firebase.google.com
2. Click "Add Project"
3. Enter project name (e.g., "Campus Navigator")
4. Follow setup wizard

### **2. Enable Firestore Database**
1. Click "Firestore Database" in sidebar
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location closest to you
5. Click "Enable"

### **3. Set Firestore Rules (Development)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**WARNING:** Change rules for production with proper authentication

### **4. Add Sample Data**

Run the seed script:
```bash
cd backend
node src/utils/addSampleData.js
```

Or manually add to Firestore:
- Collection: `locations`
- Add documents with fields:
  - `name`: "IoT Lab"
  - `type`: "lab"
  - `building`: "BSN Block"
  - `floor`: 5
  - `coordinates`: `{x: 100, y: 200, z: 0}`
  - `tags`: `["lab", "iot"]`

---

## 🎮 **Usage**

### **Search for Locations**
1. Open the app
2. Tap on "Navigate Campus"
3. Type location name (e.g., "IoT Lab", "Cafeteria")
4. Tap on search result

### **View Location Details**
- See building name, floor, room number
- View description and amenities
- Check accessibility information

### **Navigate to Location**
1. Search and select your destination
2. Tap "Navigate" (coming soon)
3. Follow turn-by-turn directions

### **Scan QR Codes**
1. Tap QR scanner icon
2. Point camera at campus QR code
3. Automatically navigate to location

---

## 📁 **Project Structure**

```
campus-navigator/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase configuration
│   │   │   └── db.js                # Database (deprecated)
│   │   ├── models/
│   │   │   └── Location.js          # Location data model
│   │   ├── controllers/
│   │   │   └── navigationController.js  # API logic
│   │   ├── routes/
│   │   │   └── navigation.js        # API routes
│   │   ├── utils/
│   │   │   ├── pathfinding.js       # A* algorithm
│   │   │   └── seedData.js          # Sample data script
│   │   └── server.js                # Express server
│   ├── .env                         # Environment variables
│   ├── serviceAccountKey.json       # Firebase credentials
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── screens/
    │   │   ├── HomeScreen.js           # Landing page
    │   │   └── navigation/
    │   │       ├── NavigationHomeScreen.js  # Search & list
    │   │       └── LocationDetail.js        # Location info
    │   ├── navigation/
    │   │   └── AppNavigator.js        # Route configuration
    │   ├── services/
    │   │   └── navigationService.js   # API calls
    │   └── config/
    │       └── index.js               # App configuration
    ├── App.js
    ├── app.json                       # Expo config
    └── package.json
```

---

## 🔌 **API Endpoints**

### **Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/navigation/search?query=lab` | Search locations |
| GET | `/navigation/locations` | Get all locations |
| GET | `/navigation/locations/:id` | Get location by ID |
| GET | `/navigation/path?startId=X&endId=Y` | Find path between locations |
| GET | `/navigation/nearby?locationId=X&radius=50` | Get nearby locations |
| GET | `/health` | Server health check |

### **Example Requests**

**Search for locations:**
```bash
GET http://localhost:5000/api/navigation/search?query=lab
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "abc123",
      "name": "IoT Lab",
      "type": "lab",
      "building": "BSN Block",
      "floor": 5,
      "roomNumber": "TR 501"
    }
  ]
}
```

---

## 🚀 **Deployment**

### **Backend (Node.js)**
Deploy to platforms like:
- **Heroku** - `git push heroku main`
- **Railway** - Connect GitHub repo
- **Render** - Auto-deploy from Git
- **Google Cloud Run** - Containerized deployment
- **AWS Elastic Beanstalk** - Managed platform

### **Frontend (React Native)**
Build for:
- **Android:** `eas build --platform android`
- **iOS:** `eas build --platform ios`
- **Web:** `expo export:web`

---

## 🤝 **Contributing**

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📝 **Development Roadmap**

### **Phase 1: Core Navigation** ✅ COMPLETED
- [x] Indoor navigation system
- [x] Location search
- [x] Pathfinding algorithm
- [x] Firebase integration
- [x] Multi-floor support

### **Phase 2: Smart Features** 🚧 IN PROGRESS
- [ ] AR Navigation
- [ ] Live crowd heatmap
- [ ] Class schedule integration
- [ ] QR code scanning
- [ ] Voice guidance

### **Phase 3: Social & Safety** 📅 PLANNED
- [ ] Social navigation
- [ ] Emergency SOS
- [ ] Friend tracking
- [ ] Safe route suggestions

### **Phase 4: Gamification** 💡 FUTURE
- [ ] Campus exploration challenges
- [ ] Achievement badges
- [ ] Leaderboards
- [ ] Daily quests

---

## 🐛 **Known Issues**

- Firebase warning on first load (resolves after database initialization)
- Location search requires exact matches (fuzzy search coming soon)
- Pathfinding doesn't account for elevator wait times
- Network error if backend not running

---

## 🔧 **Troubleshooting**

### **Backend Issues**

**Problem: "Cannot find module 'serviceAccountKey.json'"**
- **Solution:** Download Firebase service account key and place in backend folder

**Problem: "Database '(default)' not found"**
- **Solution:** Enable Firestore in Firebase Console

### **Frontend Issues**

**Problem: "Network Error" when searching**
- **Solution:** Check API_URL in navigationService.js
- Ensure backend is running
- Use correct IP address (not localhost for physical devices)

**Problem: "No locations found"**
- **Solution:** Add sample data to Firestore using seed script

---

## 📄 **License**

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 Campus Navigator Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 **Team**

**Developers:**
- Pranitha - Backend & Firebase Integration
- Shreya - Frontend Development

---

## 📧 **Contact & Support**

For questions, feedback, or support:
- **GitHub Issues:** Report bugs or request features
- **Email:** campusnavigator@example.com
- **Documentation:** See wiki for detailed guides

---

## 🙏 **Acknowledgments**

- Firebase team for real-time database platform
- React Native community for mobile framework
- Expo team for development tools
- A* pathfinding algorithm researchers
- Open source contributors

---

## 📊 **Project Stats**

- **Languages:** JavaScript, JSX
- **Framework:** React Native (Expo)
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Development Time:** Ongoing
- **Current Version:** 1.0.0

---

## 🔗 **Useful Links**

- **Firebase Console:** https://console.firebase.google.com
- **Expo Documentation:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **Node.js:** https://nodejs.org

---

**Made with ❤️ for smarter campus navigation**

**⭐ Star this repo if you find it helpful!**
<<<<<<< HEAD

---

Save this as `README.md` in your project root directory. Would you like me to also create:

1. **CONTRIBUTING.md** - Detailed contribution guidelines
2. **CODE_OF_CONDUCT.md** - Community guidelines
3. **CHANGELOG.md** - Version history
4. **.github/ISSUE_TEMPLATE/** - Bug report templates

Let me know! 🚀
=======
>>>>>>> 6391fe06a9906ac2a0d7ff969ca28e6be1a3ccb7
