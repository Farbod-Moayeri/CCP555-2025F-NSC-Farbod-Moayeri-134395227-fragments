// src/routes/api/get.js
const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const metas = await Fragment.list(ownerId);
    const expand = req.query.expand === '1';
    const fragments = expand ? metas : metas.map((m) => m.id);

    return res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'Error listing fragments');
    return res
      .status(500)
      .json({ status: 'error', error: { code: 500, message: 'unable to list fragments' } });
  }
};
