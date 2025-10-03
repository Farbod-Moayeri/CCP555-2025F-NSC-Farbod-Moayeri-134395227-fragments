// src/routes/api/post.js
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // Content-Type header must exist
    let parsedType;
    try {
      ({ type: parsedType } = contentType.parse(req));
    } catch (err) {
      logger.warn({ err }, 'Failed to parse content-type');
      return res.status(400).json(createErrorResponse(400, 'missing or invalid Content-Type'));
    }

    if (!Fragment.isSupportedType(parsedType)) {
      logger.warn({ type: parsedType }, 'Unsupported fragment type attempted');
      return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
    }

    // raw parser will give Buffer at req.body, ensure it's a non-empty Buffer
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      logger.warn('No body buffer provided or body is empty');
      return res.status(400).json(createErrorResponse(400, 'missing body'));
    }

    const ownerId = req.user.id;
    const buffer = req.body;

    // Create fragment metadata and write data
    const fragment = await Fragment.create({ ownerId, type: parsedType, size: buffer.length });
    await fragment.saveData(buffer);

    // Location header: prefer API_URL or derive from request
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl).toString();

    res.setHeader('Location', location);
    return res.status(201).json(createSuccessResponse({ fragment: fragment.toJSON() }));
  } catch (err) {
    logger.error({ err }, 'Error in POST /fragments');
    return res.status(500).json(createErrorResponse(500, 'unable to create fragment'));
  }
};
