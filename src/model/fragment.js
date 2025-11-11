// src/model/fragment.js
const { v4: uuidv4 } = require('uuid');
const db = require('./data');
const logger = require('../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

class Fragment {
  constructor({ id, ownerId, type, size, created, updated }) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created;
    this.updated = updated;
  }

  // Support text/* and application/json
  static isSupportedType(type) {
    if (!type) return false;
    return type.startsWith('text/') || type === 'application/json';
  }

  static async create({ ownerId, type, size = 0 }) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const meta = { id, ownerId, type, size, created: now, updated: now };
    await db.writeFragment(ownerId, meta);
    logger.info({ id, ownerId, type }, 'Fragment metadata created');
    return new Fragment(meta);
  }

  static async byId(ownerId, id) {
    const meta = await db.readFragment(ownerId, id);
    return meta ? new Fragment(meta) : null;
  }

  static async list(ownerId) {
    // Ensure db.listFragments cannot cause an undefined result to bubble up.
    // Always return an array (possibly empty).
    const metas = await db.listFragments(ownerId);
    return Array.isArray(metas) ? metas : [];
  }

  async saveData(buffer) {
    if (!Buffer.isBuffer(buffer)) throw new Error('saveData expects a Buffer');
    await db.writeFragmentData(this.ownerId, this.id, buffer);
    const meta = await db.readFragment(this.ownerId, this.id);
    if (meta) {
      this.size = meta.size;
      this.updated = meta.updated;
    }
    return true;
  }

  async getData() {
    return await db.readFragmentData(this.ownerId, this.id);
  }

  // Markdown conversion
  async getConverted(ext) {
    const data = await this.getData();
    if (!data) return null;

    const text = data.toString();

    // Markdown -> HTML
    if (this.type === 'text/markdown' && ext === 'html') {
      return {
        convertedType: 'text/html',
        convertedData: Buffer.from(md.render(text)),
      };
    }

    // JSON pretty output
    if (this.type === 'application/json' && ext === 'txt') {
      return {
        convertedType: 'text/plain',
        convertedData: Buffer.from(JSON.stringify(JSON.parse(text), null, 2)),
      };
    }

    // If no conversion supported
    return null;
  }

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
