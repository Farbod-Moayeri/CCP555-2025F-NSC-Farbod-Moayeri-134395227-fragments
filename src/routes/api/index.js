// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { authenticate } = require('../../auth'); // top-level auth exported from src/auth/index.js
const postHandler = require('./post');
const getHandler = require('./get');
const getByIdHandler = require('./getById');

const router = express.Router();

// raw body parser factory
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  });

// Public routes that still require authentication
router.get('/fragments', authenticate(), getHandler);
router.post('/fragments', authenticate(), rawBody(), postHandler);
router.get('/fragments/:id', authenticate(), getByIdHandler);

module.exports = router;
