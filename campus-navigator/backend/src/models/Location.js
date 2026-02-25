const { db } = require('../config/firebase');

class Location {
  static collection = db.collection('locations');

  static validateData(data) {
    const validTypes = ['building', 'floor', 'room', 'landmark'];

    if (!data.name || !data.type || !data.building) {
      throw new Error('Name, type, and building are required');
    }

    if (!validTypes.includes(data.type)) {
      throw new Error('Invalid location type');
    }

    if (
      !data.coordinates ||
      typeof data.coordinates.x !== 'number' ||
      typeof data.coordinates.y !== 'number'
    ) {
      throw new Error('Valid coordinates (x, y) are required');
    }

    return {
      name: data.name.trim(),
      type: data.type,
      building: data.building,
      floor: data.floor || 0,
      roomNumber: data.roomNumber || null,
      description: data.description || null,
      coordinates: {
        x: data.coordinates.x,
        y: data.coordinates.y,
        z: data.coordinates.z || 0
      },
      qrCode: data.qrCode || null,
      connectedTo: data.connectedTo || [],
      isAccessible:
        data.isAccessible !== undefined ? data.isAccessible : true,
      tags: data.tags || [],
      imageUrl: data.imageUrl || null,
      createdAt: data.createdAt || new Date()
    };
  }

  // ✅ FIXED CREATE (NO DUPLICATES)
  static async create(data) {
    const validatedData = this.validateData(data);

    // Use QR code if available, otherwise name as document ID
    const docId = validatedData.qrCode || validatedData.name;

    const docRef = this.collection.doc(docId);

    // This overwrites instead of creating duplicates
    await docRef.set(validatedData);

    return { id: docId, ...validatedData };
  }

  static async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async find(filters = {}) {
    let query = this.collection;

    if (filters.building) {
      query = query.where('building', '==', filters.building);
    }
    if (filters.floor !== undefined) {
      query = query.where('floor', '==', filters.floor);
    }
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    if (filters.isAccessible !== undefined) {
      query = query.where('isAccessible', '==', filters.isAccessible);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async search(searchTerm) {
    const allDocs = await this.collection.get();
    const searchLower = searchTerm.toLowerCase();

    return allDocs.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(location => {
        const nameMatch =
          location.name?.toLowerCase().includes(searchLower);
        const descMatch =
          location.description?.toLowerCase().includes(searchLower);
        const tagMatch =
          location.tags?.some(tag =>
            tag.toLowerCase().includes(searchLower)
          );

        return nameMatch || descMatch || tagMatch;
      });
  }

  static async update(id, data) {
    await this.collection.doc(id).update(data);
    return this.findById(id);
  }

  static async delete(id) {
    await this.collection.doc(id).delete();
    return { id, deleted: true };
  }
}

module.exports = Location;