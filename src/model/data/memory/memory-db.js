// src/model/data/memory/memory-db.js
//const { v4: uuidv4 } = require('uuid');

class MemoryDB {
  constructor() {
    // Map ownerId => Map(fragmentId => { metadata, data(Buffer) })
    this.store = new Map();
  }

  async writeFragment(ownerId, fragment) {
    if (!ownerId || !fragment || !fragment.id) {
      throw new Error('writeFragment: missing params');
    }
    let userMap = this.store.get(ownerId);
    if (!userMap) {
      userMap = new Map();
      this.store.set(ownerId, userMap);
    }
    const existing = userMap.get(fragment.id) || {};
    // keep existing data if present
    userMap.set(fragment.id, {
      metadata: {
        ...existing.metadata,
        ...fragment, // fragment should contain id, ownerId, type, size, created, updated
      },
      data: existing.data || Buffer.alloc(0),
    });
    return userMap.get(fragment.id).metadata;
  }

  async readFragment(ownerId, id) {
    const userMap = this.store.get(ownerId);
    if (!userMap) return null;
    const entry = userMap.get(id);
    return entry ? entry.metadata : null;
  }

  async writeFragmentData(ownerId, id, buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('writeFragmentData expects a Buffer');
    }
    let userMap = this.store.get(ownerId);
    if (!userMap) {
      userMap = new Map();
      this.store.set(ownerId, userMap);
    }
    const entry = userMap.get(id) || { metadata: null, data: Buffer.alloc(0) };
    entry.data = buffer;
    userMap.set(id, entry);
    // update metadata size and updated time if metadata exists
    if (entry.metadata) {
      entry.metadata.size = buffer.length;
      entry.metadata.updated = new Date().toISOString();
    }
    return true;
  }

  async readFragmentData(ownerId, id) {
    const userMap = this.store.get(ownerId);
    if (!userMap) return null;
    const entry = userMap.get(id);
    return entry ? entry.data : null;
  }

  async listFragments(ownerId) {
    const userMap = this.store.get(ownerId);
    if (!userMap) return [];
    // Return array of metadata objects
    return Array.from(userMap.values()).map((e) => e.metadata);
  }
}

module.exports = new MemoryDB();
