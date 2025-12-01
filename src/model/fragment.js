// src/model/fragment.js
const { v4: uuidv4 } = require('uuid');
const db = require('./data');
const logger = require('../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const sharp = require('sharp');

// Supported image MIME types
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// Map URL extension -> sharp format
const EXT_TO_IMAGE_FORMAT = {
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  webp: 'webp',
  avif: 'avif',
  gif: 'gif',
};

class Fragment {
  constructor({ id, ownerId, type, size, created, updated }) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created;
    this.updated = updated;
  }

  // Support text/*, application/json, and common image types
  static isSupportedType(type) {
    if (!type) return false;

    // Strip charset etc: "text/plain; charset=utf-8" -> "text/plain"
    const mime = type.split(';')[0].trim().toLowerCase();

    if (mime.startsWith('text/')) return true;
    if (mime === 'application/json') return true;
    if (SUPPORTED_IMAGE_TYPES.includes(mime)) return true;

    return false;
  }

  static async create({ ownerId, type, size = 0 }) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const meta = { id, ownerId, type, size, created: now, updated: now };
    await db.writeFragment(ownerId, meta);
    logger.info({ id, ownerId, type }, 'Fragment metadata created');
    return new Fragment(meta);
  }

  async delete() {
    await db.deleteFragment(this.ownerId, this.id);
    return true;
  }

  static async byId(ownerId, id) {
    const meta = await db.readFragment(ownerId, id);
    return meta ? new Fragment(meta) : null;
  }

  static async list(ownerId) {
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
    return db.readFragmentData(this.ownerId, this.id);
  }

  // Conversion logic for text/markdown, JSON, and images
  async getConverted(ext) {
    const data = await this.getData();
    if (!data) return null;

    const extLower = ext.toLowerCase();

    // ─── Image conversions via sharp ───────────────────────────────
    if (this.type.startsWith('image/')) {
      const targetFormat = EXT_TO_IMAGE_FORMAT[extLower];
      if (!targetFormat) {
        // unsupported target extension (e.g. .txt, .html for images)
        return null;
      }

      const sourceFormat = this.type.split('/')[1];

      // If same format requested, just return original data
      if (targetFormat === sourceFormat) {
        return {
          convertedType: this.type,
          convertedData: data,
        };
      }

      try {
        const convertedBuffer = await sharp(data).toFormat(targetFormat).toBuffer();
        return {
          convertedType: `image/${targetFormat}`,
          convertedData: convertedBuffer,
        };
      } catch (err) {
        // If sharp fails for any reason, log and fall back to original data
        logger.warn({ err }, 'sharp image conversion failed, returning original data');
        return {
          convertedType: `image/${targetFormat}`,
          convertedData: data,
        };
      }
    }

    // ─── Text / JSON conversions ───────────────────────────────────
    const text = data.toString();

    // Markdown -> HTML
    if (this.type === 'text/markdown' && extLower === 'html') {
      return {
        convertedType: 'text/html',
        convertedData: Buffer.from(md.render(text)),
      };
    }

    // JSON -> pretty-printed plain text
    if (this.type === 'application/json' && extLower === 'txt') {
      try {
        const json = JSON.parse(text);
        return {
          convertedType: 'text/plain',
          convertedData: Buffer.from(JSON.stringify(json, null, 2)),
        };
      } catch (err) {
        logger.warn({ err }, 'invalid JSON content during conversion');
        return null;
      }
    }

    // No supported conversion
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
