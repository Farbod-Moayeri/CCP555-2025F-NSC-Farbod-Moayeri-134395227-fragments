// src/hash.js
const crypto = require('crypto');

/**
 * Hash the provided identifier (email) using SHA-256 and return hex digest.
 * Deterministic and safe to store instead of raw email.
 */
function hashString(s) {
  if (!s) throw new Error('hashString: missing input');
  return crypto.createHash('sha256').update(s).digest('hex');
}

module.exports = hashString;
