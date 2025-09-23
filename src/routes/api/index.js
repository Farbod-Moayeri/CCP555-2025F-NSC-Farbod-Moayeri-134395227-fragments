// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Import your authentication function/middleware
const { authenticate } = require('../../auth'); // NOTE: The path may be different for you

// Apply the authenticate() middleware before the main route handler.
router.get('/fragments', authenticate(), (req, res) => {
  // This code will now only run for authenticated requests.
  // ... your logic to get and return fragments for the authenticated user
  res.status(200).json({ status: 'ok', fragments: [] });
});
// Other routes (POST, DELETE, etc.) will go here later on...

module.exports = router;
