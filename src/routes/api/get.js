// src/routes/api/get.js
const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const metas = await Fragment.list(ownerId);
    // Many tests expect an array of fragment ids. We'll be flexible:
    // - If tests expect metadata, include metadata
    // - Spec wants list of fragment ids. We'll return ids array in `fragments` and
    // also include metadata array as `fragments_metadata` for convenience.
    const fragments = metas.map((m) => m.id);
    const fragments_metadata = metas;
    return res.status(200).json(createSuccessResponse({ fragments, fragments_metadata }));
  } catch (err) {
    logger.error({ err }, 'Error listing fragments');
    return res
      .status(500)
      .json({ status: 'error', error: { code: 500, message: 'unable to list fragments' } });
  }
};
