const {validationResult} = require('express-validator');

const classifyIntent = require("../services/classify-intent");
const llmClassifyIntent = require('../services/llm/llm-classify-intent');

const farmersController = require('./farmers-controllers');
const parcelsController = require('./parcels-controllers');
const reportFrequenciesController = require('./report-frequencies-controllers');


const parseResponse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
              .json({reply: 'Invalid request. Please provide a valid phone number (from) and message (text).'});
  }

  if (!req.isLinked) {
    return farmersController.handleLinking(req, res, next);
  }

  const {text} = req.body;

  let intent = await llmClassifyIntent(text);
  if (!intent) {
    intent = classifyIntent(text);
  }

  // route based on intent
  switch (intent.type) {
    case 'list_parcels':
      return parcelsController.getAllParcels(req, res, next);

    case 'parcel_details':
      if (!intent.parcelId) {
        return res.json({reply: 'Please specify a parcel ID (e.g., P1, P2)'});
      }
      req.parcelId = intent.parcelId;
      return parcelsController.getParcelDetails(req, res, next);

    case 'parcel_status':
      if (!intent.parcelId) {
        return res.json({reply: 'Please specify a parcel ID (e.g., P1, P2)'});
      }
      req.parcelId = intent.parcelId;
      return parcelsController.getParcelStatus(req, res, next);

    case 'set_frequency':
      req.frequency = intent.frequency;
      return reportFrequenciesController.setFrequency(req, res, next);

    default:
      return res.json({
        reply: 'I can help you with your parcels. Try asking "Show me my parcels" or "Tell me about parcel P1".'
      });
  }
};

exports.parseResponse = parseResponse;