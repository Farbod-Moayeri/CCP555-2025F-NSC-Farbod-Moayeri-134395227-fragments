// src/routes/api/get.js
const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user && req.user.id;
    const expand = req.query.expand === '1';

    // Ensure list() always returns an array (defensive)
    const metas = (await Fragment.list(ownerId)) || [];

    // If expand, return metadata objects; otherwise return IDs
    let fragments;
    if (expand) {
      fragments = metas; // AWS returns metadata objects here
    } else {
      // If AWS returned IDs directly, just return them
      if (typeof metas[0] === 'string') {
        fragments = metas;
      } else {
        fragments = metas.map((m) => m.id);
      }
    }

    // Remove nulls if any (defensive)
    const cleanFragments = fragments.filter((f) => f !== null && f !== undefined);

    return res.status(200).json(createSuccessResponse({ fragments: cleanFragments }));
  } catch (err) {
    logger.error({ err }, 'Error listing fragments');
    return res
      .status(500)
      .json({ status: 'error', error: { code: 500, message: 'unable to list fragments' } });
  }
};
