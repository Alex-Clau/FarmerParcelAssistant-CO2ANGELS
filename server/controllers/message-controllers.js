const {validationResult} = require('express-validator');

const HttpError = require('./../models/http-error');
const {classifyIntent} = require("../services/llm-service");

const phoneLinksController = require('./phone-links-controllers');
const parcelsController = require('./parcels-controllers');
const reportFrequenciesController = require('./report-frequencies-controllers');

const parseWithRegex = (text) => { // fallback for llm
  const lowerText = text.toLowerCase()
                        .trim();

  const extractParcelId = (text) => {
    const match = text.match(/(?:^|\s)(?:parcel\s*)?p?(\d+)(?:\s|$)/i);
    return match ? `P${match[1]}` : null;
  };

  const parcelId = extractParcelId(lowerText);

  // list parcels
  if (lowerText.match(/(show|list|what).*parcel|parcel.*(list|show|all)/i)) {
    return {type: 'list_parcels'};
  }

  // parcel details
  if (parcelId && lowerText.match(/(detail|about|information|tell me)/i)) {
    return {type: 'parcel_details', parcelId};
  }

  // status summary
  if (parcelId && lowerText.match(/(how|status|summary)/i)) {
    return {type: 'parcel_status', parcelId};
  }

  // set the frequency of reports
  const freqMatch = lowerText.match(/(daily|weekly|monthly|every\s+\d+\s+days?)/i);
  if (lowerText.match(/(set|make).*(report|frequency)/i) && freqMatch) {
    let frequency = freqMatch[1].toLowerCase();

    return {type: 'set_frequency', frequency};
  }

  return {type: 'unknown'};
};

const parseResponse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Validation failed!', 400));
  }

  if (!req.isLinked) {
    return phoneLinksController.handleLinking(req, res, next);
  }

  const {text} = req.body;
  let intent = await classifyIntent(text);

  if (!intent) {
    intent = parseWithRegex(text);
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