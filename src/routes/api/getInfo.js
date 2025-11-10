// src/routes/api/getInfo.js
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

    return res.status(200).json(createSuccessResponse({ fragment: fragment.toJSON() }));
  } catch (err) {
    logger.error({ err }, 'Error fetching fragment info');
    return res.status(500).json(createErrorResponse(500, 'unable to fetch fragment info'));
  }
};
