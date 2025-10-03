// src/routes/api/getById.js
const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const id = req.params.id;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    const data = await fragment.getData();
    if (fragment.type === 'text/plain') {
      // respond with text body and proper content-type
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(data);
    }

    // Fallback: return JSON metadata and Base64 body
    const bodyBase64 = data ? data.toString('base64') : null;
    return res
      .status(200)
      .json(createSuccessResponse({ fragment: fragment.toJSON(), data: bodyBase64 }));
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    return res.status(500).json(createErrorResponse(500, 'unable to fetch fragment'));
  }
};
