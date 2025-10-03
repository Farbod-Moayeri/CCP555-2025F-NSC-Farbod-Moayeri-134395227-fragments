// src/model/data/memory/index.js

const db = require('./memory-db');

/**
 * Expose the async functions required by the rest of the app:
 * - writeFragment(ownerId, fragment)
 * - readFragment(ownerId, id)
 * - writeFragmentData(ownerId, id, buffer)
 * - readFragmentData(ownerId, id)
 * - listFragments(ownerId)
 */

module.exports = {
  readFragment: async (ownerId, id) => db.readFragment(ownerId, id),
  writeFragment: async (ownerId, fragment) => db.writeFragment(ownerId, fragment),
  readFragmentData: async (ownerId, id) => db.readFragmentData(ownerId, id),
  writeFragmentData: async (ownerId, id, buffer) => db.writeFragmentData(ownerId, id, buffer),
  listFragments: async (ownerId) => db.listFragments(ownerId),
};
