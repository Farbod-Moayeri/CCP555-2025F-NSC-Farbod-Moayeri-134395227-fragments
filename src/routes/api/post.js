// src/routes/api/post.js
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
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

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json(createErrorResponse(400, 'missing body'));
    }

    if (parsedType === 'application/json') {
      try {
        // Try to parse the buffer as a string, then as JSON
        JSON.parse(req.body.toString());
      } catch (err) {
        logger.warn({ err }, 'Invalid JSON content submitted');
        return res.status(400).json(createErrorResponse(400, 'body is not valid JSON'));
      }
    }

    const ownerId = req.user.id;
    const buffer = req.body;

    const fragment = await Fragment.create({ ownerId, type: parsedType, size: buffer.length });
    await fragment.saveData(buffer);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl).toString();

    res.setHeader('Location', location);
    return res.status(201).json(createSuccessResponse({ fragment: fragment.toJSON() }));
  } catch (err) {
    logger.error({ err }, 'Error in POST /fragments');
    return res.status(500).json(createErrorResponse(500, 'unable to create fragment'));
  }
};
