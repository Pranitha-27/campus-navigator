const mongoose = require('mongoose');

// Update this with your actual MongoDB URI from .env or config
const MONGODB_URI = 'mongodb+srv://Pranitha_27:Pranitha2706@cluster0.ryj22iw.mongodb.net/campus-navigator?retryWrites=true&w=majority&appName=Cluster0'

async function resetDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();