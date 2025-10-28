🗺️ Campus Navigator
A smart navigation and seat booking system for college campuses. Navigate to any lab or location and book seats in cafeteria/bakery with real-time availability.

📋 Table of Contents

Features
Tech Stack
Project Structure
Prerequisites
Installation
Configuration
Running the Application
API Documentation
Contributing
License


✨ Features
🧭 Indoor Navigation

Find any lab/room in college buildings
Turn-by-turn directions
Multiple positioning methods (QR codes, BLE beacons, Wi-Fi)
Search functionality for quick location access
Visual floor plans with real-time navigation

🪑 Seat Booking System

Real-time seat availability (like BookMyShow)
Book tables/seats in cafeteria and bakery
Visual seat selection interface
Time-limited bookings with auto-release
QR code check-in system
Booking history and management

🎯 Additional Features

Multi-building support
Nearby locations discovery
Popular locations tracking
User-friendly mobile interface
Push notifications for bookings


🛠️ Tech Stack
Backend

Runtime: Node.js (v18+)
Framework: Express.js
Database: MongoDB (MongoDB Atlas)
ODM: Mongoose
Authentication: JWT (JSON Web Tokens)
Real-time: Socket.io
Environment: dotenv

Frontend

Framework: React Native (Expo)
Navigation: React Navigation
State Management: React Context API / Redux
HTTP Client: Axios
UI Components: React Native Paper / Native Base
Maps: Leaflet.js / Custom SVG

DevOps & Tools

Version Control: Git & GitHub
API Testing: Thunder Client / Postman
Code Editor: VS Code
Package Manager: npm


📁 Project Structure
campus-navigator/
```plaintext
│
├── backend/                    # Backend Node.js application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── db.js          # MongoDB connection
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Location.js
│   │   │   ├── Booking.js
│   │   │   └── Table.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js
│   │   │   ├── navigation.js
│   │   │   └── booking.js
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── navigationController.js
│   │   │   └── bookingController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   └── auth.js
│   │   ├── utils/             # Helper functions
│   │   │   └── pathfinding.js
│   │   └── server.js          # Entry point
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/                   # React Native mobile app
│   ├── src/
│   │   ├── screens/           # App screens
│   │   │   ├── auth/
│   │   │   ├── navigation/
│   │   │   └── booking/
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API services
│   │   ├── navigation/        # Navigation config
│   │   ├── context/           # Global state
│   │   └── utils/             # Utilities
│   ├── assets/                # Images, fonts, etc.
│   ├── App.js
│   └── package.json
│
└── README.md                   # You are here!
```

✅ Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher) - Download
npm (comes with Node.js)
Git - Download
MongoDB Atlas Account (free tier) - Sign up
Expo Go app on your phone - Android | iOS

Optional:

VS Code - Download
Android Studio or Xcode (for production builds)


🚀 Installation
1. Clone the Repository
bashgit clone https://github.com/yourusername/campus-navigator.git
cd campus-navigator
2. Backend Setup
bash# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string
3. Frontend Setup
bash# Navigate to frontend folder (from root)
cd ../frontend

# Install dependencies
npm install

# Or if using Expo
npx expo install

⚙️ Configuration
Backend Configuration
Create a .env file in the backend/ directory:
env# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campus-navigator?retryWrites=true&w=majority

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# JWT Expiration
JWT_EXPIRE=7d
Frontend Configuration
Create a config.js file in frontend/src/:
javascriptexport const API_URL = 'http://localhost:5000/api';
// For testing on physical device, use your computer's IP:
// export const API_URL = 'http://192.168.1.100:5000/api';
MongoDB Atlas Setup

Create account at MongoDB Atlas
Create a new cluster (free tier M0)
Create database user with password
Whitelist your IP address (or allow 0.0.0.0/0 for development)
Get connection string and add to .env


🏃 Running the Application
Start Backend Server
bash# From backend directory
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
Expected output:
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 Environment: development
Start Frontend App
bash# From frontend directory
cd frontend

# Start Expo development server
npx expo start

# Or
npm start
Then:

Scan QR code with Expo Go app (Android/iOS)
Or press a for Android emulator
Or press i for iOS simulator (Mac only)


📡 API Documentation
Base URL
http://localhost:5000/api
Navigation Endpoints
Search Locations
httpGET /navigation/search?query=BOT Lab
Response:
json{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "BOT Lab",
      "building": "BSN Block",
      "floor": 1,
      "roomNumber": "101"
    }
  ]
}
Get All Locations
httpGET /navigation/locations?building=BSN Block&floor=1
Find Path Between Locations
httpGET /navigation/path?startId=location1_id&endId=location2_id
Response:
json{
  "success": true,
  "data": {
    "path": [...],
    "distance": 45.5,
    "steps": [
      {
        "from": "Main Entrance",
        "to": "BOT Lab",
        "instruction": "Walk 25m to BOT Lab",
        "distance": 25
      }
    ]
  }
}
Booking Endpoints
Get Available Tables
httpGET /booking/tables?location=cafeteria
Book a Table
httpPOST /booking/book
Content-Type: application/json

{
  "tableId": "table_01",
  "duration": 45
}
My Bookings
httpGET /booking/my-bookings
Authorization: Bearer <token>

🧪 Testing
Test Backend API
Using Thunder Client (VS Code Extension):

Install Thunder Client extension
Import API collection (coming soon)
Test endpoints

Using cURL:
bash# Test server
curl http://localhost:5000

# Search locations
curl http://localhost:5000/api/navigation/search?query=lab

# Get all locations
curl http://localhost:5000/api/navigation/locations
Test Frontend
bash# Run on physical device
npx expo start --tunnel

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios

🗂️ Database Schema
Location Schema
javascript{
  name: String,           // "BOT Lab"
  type: String,           // "room" | "building" | "landmark"
  building: String,       // "BSN Block"
  floor: Number,          // 1
  roomNumber: String,     // "101"
  coordinates: {
    x: Number,
    y: Number,
    z: Number
  },
  connectedTo: [{
    locationId: ObjectId,
    distance: Number,
    pathType: String
  }]
}
Booking Schema
javascript{
  userId: ObjectId,
  tableId: ObjectId,
  startTime: Date,
  endTime: Date,
  status: String,         // "active" | "completed" | "cancelled"
  arrived: Boolean
}

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a new branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request


📝 Development Roadmap
Phase 1: Core Navigation ✅

 Backend setup
 MongoDB connection
 Location model
 Pathfinding algorithm
 Sample data population
 API testing

Phase 2: Booking System

 Table/seat models
 Booking logic
 Real-time updates
 QR code system

Phase 3: Frontend Mobile App

 Basic UI screens
 Navigation interface
 Booking interface
 API integration

Phase 4: Advanced Features

 Push notifications
 BLE beacon support
 Analytics dashboard
 Admin panel


🐛 Known Issues

 Pathfinding needs optimization for large campuses
 iOS camera permissions need better handling
 Booking timeout edge cases


📞 Support
For support and queries:

Email: your.email@college.edu
Project Issues: GitHub Issues


👥 Team

Your Name - Full Stack Developer
Add team members here


🙏 Acknowledgments

MongoDB Atlas for database hosting
Expo for React Native development platform
OpenStreetMap for indoor mapping concepts
College administration for support


📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🔒 Security
Please report security vulnerabilities to: security@yourdomain.com

Made with ❤️ for making campus navigation easier!

📸 Screenshots
Coming soon...

🎥 Demo Video
Coming soon...

Last Updated: October 2025
