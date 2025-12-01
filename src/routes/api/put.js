// src/routes/api/put.js
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // ✅ correct owner id
    const ownerId = req.user.id;
    const id = req.params.id;

    // Look up existing fragment
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    // Require body
    if (!req.body || req.body.length === 0) {
      return res.status(400).json(createErrorResponse(400, 'missing body'));
    }

    // Parse Content-Type header
    let parsedType;
    try {
      ({ type: parsedType } = contentType.parse(req));
    } catch (err) {
      logger.warn({ err }, 'Failed to parse content-type on PUT');
      return res.status(400).json(createErrorResponse(400, 'missing or invalid Content-Type'));
    }

    // Type mismatch: cannot change fragment type
    if (parsedType !== fragment.type) {
      return res.status(400).json(createErrorResponse(400, 'fragment type cannot be changed'));
    }

    // Save new data
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    await fragment.saveData(buffer);

    return res.status(200).json(createSuccessResponse({ fragment: fragment.toJSON() }));
  } catch (err) {
    logger.error({ err }, 'Error in PUT /fragments/:id');
    return res.status(500).json(createErrorResponse(500, 'unable to update fragment'));
  }
};
