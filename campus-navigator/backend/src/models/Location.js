const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['building', 'floor', 'room', 'landmark'],
    required: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    default: 0
  },
  roomNumber: String,
  description: String,
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, default: 0 } // floor level
  },
  // For QR code based navigation
  qrCode: String,
  // For connecting to other locations
  connectedTo: [{
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    distance: Number, // in meters
    pathType: {
      type: String,
      enum: ['corridor', 'stairs', 'elevator', 'outdoor'],
      default: 'corridor'
    }
  }],
  // Additional info
  isAccessible: {
    type: Boolean,
    default: true
  },
  tags: [String], // ['lab', 'computer', 'important']
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search
locationSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Location', locationSchema);