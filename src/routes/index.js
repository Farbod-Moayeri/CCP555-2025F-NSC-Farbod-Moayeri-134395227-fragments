// src/routes/index.js
const express = require('express');

const { version, author } = require('../../package.json');

const router = express.Router();

const apiRoutes = require('./api');

// Mount API routes at /v1
router.use('/v1', apiRoutes);

/**
 * Health check
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl:
      'https://github.com/Farbod-Moayeri/CCP555-2025F-NSC-Farbod-Moayeri-134395227-fragments',
    version,
  });
});

module.exports = router;
