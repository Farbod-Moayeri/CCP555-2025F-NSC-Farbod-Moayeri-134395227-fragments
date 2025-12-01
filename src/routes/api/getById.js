// src/routes/api/getById.js
const path = require('path');
const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // ✅ use hashed user id, not the whole req.user object
    const ownerId = req.user.id;
    const idWithExt = req.params.id;

    // Extract extension if any, e.g., "123.html" -> id="123", ext="html"
    const ext = path.extname(idWithExt).substring(1);
    const id = ext ? idWithExt.slice(0, -(ext.length + 1)) : idWithExt;

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    let data;
    let type = fragment.type;

    if (ext) {
      // Handle conversions (.html, .jpg, etc.)
      const converted = await fragment.getConverted(ext);
      if (!converted) {
        return res.status(415).json(createErrorResponse(415, 'unsupported conversion'));
      }
      data = converted.convertedData;
      type = converted.convertedType;
    } else {
      // Raw fragment data
      data = await fragment.getData();
    }

    res.setHeader('Content-Type', `${type}; charset=utf-8`);
    return res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    return res.status(500).json(createErrorResponse(500, 'unable to fetch fragment'));
  }
};
