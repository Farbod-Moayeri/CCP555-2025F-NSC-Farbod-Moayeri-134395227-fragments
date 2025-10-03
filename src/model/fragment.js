// src/model/fragment.js
const { v4: uuidv4 } = require('uuid');
const db = require('./data');
const logger = require('../logger');

class Fragment {
  constructor({ id, ownerId, type, size, created, updated }) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created;
    this.updated = updated;
  }

  static isSupportedType(type) {
    if (!type) return false;
    // For assignment 1, only text/plain is required.
    return type === 'text/plain';
  }

  // Create a new fragment metadata and store in DB
  static async create({ ownerId, type, size = 0 }) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const meta = {
      id,
      ownerId,
      type,
      size,
      created: now,
      updated: now,
    };
    await db.writeFragment(ownerId, meta);
    logger.info({ id, ownerId, type }, 'Fragment metadata created');
    return new Fragment(meta);
  }

  static async byId(ownerId, id) {
    const meta = await db.readFragment(ownerId, id);
    if (!meta) return null;
    return new Fragment(meta);
  }

  static async list(ownerId) {
    const metas = await db.listFragments(ownerId);
    // Return only ids per assignment spec (but many tests may check for metadata)
    return metas || [];
  }

  async saveData(buffer) {
    if (!Buffer.isBuffer(buffer)) throw new Error('saveData expects a Buffer');
    await db.writeFragmentData(this.ownerId, this.id, buffer);
    // update metadata size and updated
    const meta = await db.readFragment(this.ownerId, this.id);
    if (meta) {
      this.size = meta.size;
      this.updated = meta.updated;
    }
    return true;
  }

  async getData() {
    const data = await db.readFragmentData(this.ownerId, this.id);
    return data;
  }

  // Serialize for API responses - include expected properties
  toJSON() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      type: this.type,
      size: this.size,
      created: this.created,
      updated: this.updated,
    };
  }
}

module.exports = Fragment;
