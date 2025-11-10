// src/routes/api/getById.js
const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const idParam = req.params.id;
    const [id, ext] = idParam.split('.');

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    // Check for conversion
    if (ext) {
      const converted = await fragment.getConverted(ext);
      if (converted) {
        res.setHeader('Content-Type', converted.convertedType + '; charset=utf-8');
        return res.status(200).send(converted.convertedData);
      }
      return res.status(415).json(createErrorResponse(415, 'unsupported conversion'));
    }

    const data = await fragment.getData();

    // Return JSON pretty for application/json
    if (fragment.type === 'application/json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(data.toString());
    }

    // Default: text/*
    res.setHeader('Content-Type', fragment.type + '; charset=utf-8');
    return res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    return res.status(500).json(createErrorResponse(500, 'unable to fetch fragment'));
  }
};
