// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { authenticate } = require('../../auth');
const postHandler = require('./post');
const getHandler = require('./get');
const getByIdHandler = require('./getById');
const getInfoHandler = require('./getInfo');
const deleteHandler = require('./delete');

const router = express.Router();

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

router.delete('/fragments/:id', authenticate(), deleteHandler);
router.get('/fragments', authenticate(), getHandler);
router.post('/fragments', authenticate(), rawBody(), postHandler);
router.get('/fragments/:id', authenticate(), getByIdHandler);
router.get('/fragments/:id/info', authenticate(), getInfoHandler);

module.exports = router;
