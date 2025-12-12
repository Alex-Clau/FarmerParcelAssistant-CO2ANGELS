const {validationResult} = require('express-validator');
const HttpError = require('./../models/http-error');
const phoneLinksController = require('./phone-links-controllers');

const parseResponse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Validation failed!', 400));
  }
  
  if (!req.isLinked) { // delegate to be linked
    return phoneLinksController.handleLinking(req, res, next);
  }

  // parse message and route to the appropriate handler
  const { text } = req.body;
  const lowerText = text.toLowerCase();

  if (lowerText.includes('parcel') && (lowerText.includes('list') || lowerText.includes('show') || lowerText.includes('all'))) {
    // TODO: return parcelsController.listParcels(req, res, next);
  }

  if (lowerText.includes('parcel') && lowerText.match(/p\d+/i)) {
    // TODO: Extract parcel ID and return parcelsController.getParcelDetails(req, res, next);
  }

  // default response
  return res.json({
    reply: 'I can help you with your parcels. Try asking "Show me my parcels" or "Tell me about parcel P1".'
  });
};

module.exports = {
  parseResponse
};
