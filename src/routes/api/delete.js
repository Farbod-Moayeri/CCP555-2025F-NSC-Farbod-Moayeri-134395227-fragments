const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const id = req.params.id;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    await fragment.delete();

    return res.status(200).json(createSuccessResponse({ status: 'deleted', id }));
  } catch (err) {
    logger.error({ err }, 'Error deleting fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to delete fragment'));
  }
};
