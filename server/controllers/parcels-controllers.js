const Parcels = require('./../models/parcels');
const ParcelIndices = require('./../models/parcel_indices');

const HttpError = require('./../models/http-error');
const generateStatusSummary = require("../services/llm/llm-summary-parcel-indices");
const formatDate = require("../services/format-date");

const getParcelWithIndices = async (parcelId, farmerId, next) => {
  let parcel;
  try {
    parcel = await Parcels.findById(parcelId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find parcel', 500));
  }

  if (!parcel) {
    return {error: `Parcel ${parcelId} not found.`};
  }

  if (parcel.farmer_id !== farmerId) { // verify the parcel belongs to the current farmer
    // IMPORTANT -> better for the farmer to know only of his parcels so he doesn't have an idea how many parcels we have in db
    return {error: `Parcel ${parcelId} not found.`}; // instead of 'You do not have access to this parcel'
  }

  // get all indices for this parcel (ordered by date DESC)
  let indices;
  try {
    indices = await ParcelIndices.findByParcelId(parcelId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not fetch parcel indices.', 500));
  }

  return {
    parcel,
    indices: indices || [],
    latest: indices && indices.length > 0 ? indices[0] : null
  };
}

const getAllParcels = async (req, res, next) => {
  const {farmerId} = req;
  let parcels;

  try {
    parcels = await Parcels.findByFarmerId(farmerId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find your parcels.', 500));
  }

  if (!parcels || parcels.length === 0) {
    return res.json({reply: 'You do not have any parcels registered yet.'});
  }

  const parcelList = parcels
    .map((parcel) => `${parcel.id} - ${parcel.name} (${parcel.area_ha} ha, ${parcel.crop})`)
    .join('\n');

  return res.json({reply: `You have ${parcels.length} ${parcels.length > 1 ? 'parcels:' : 'parcel:'}\n${parcelList}`});
};

const getParcelDetails = async (req, res, next) => {
  const {parcelId, farmerId} = req;

  let result;
  try {
    result = await getParcelWithIndices(parcelId, farmerId, next);
  } catch (error) {
    return next(new HttpError('Unexpected error occurred', 500)); // for god knows what errors just to be sure
  }

  if (!result) { // if next was called in the helper
    return;
  }

  if (result.error) {
    return res.json({reply: result.error});
  }

  const {parcel, latest} = result;

  if (!latest) {
    return res.json({
      reply: `Parcel ${parcel.id} - ${parcel.name}\nArea: ${parcel.area_ha} ha\nCrop: ${parcel.crop}\n\nNo indices available yet.`
    });
  }

  const formattedDate = formatDate(latest.date);

  let reply = `Parcel ${parcel.id} – ${parcel.name}\n`;
  reply += `Area: ${parcel.area_ha} ha\n`;
  reply += `Crop: ${parcel.crop}\n`;
  reply += `Latest indices (${formattedDate}):\n`;
  reply += `NDVI: ${latest.ndvi !== null && latest.ndvi !== undefined ? latest.ndvi : 'no value available for this date'}\n`;
  reply += `NDMI: ${latest.ndmi !== null && latest.ndmi !== undefined ? latest.ndmi : 'no value available for this date'}\n`;
  reply += `NDWI: ${latest.ndwi !== null && latest.ndwi !== undefined ? latest.ndwi : 'no value available for this date'}\n`;
  reply += `SOC: ${latest.soc !== null && latest.soc !== undefined ? latest.soc : 'no value available for this date'}\n`;
  reply += `Nitrogen: ${latest.nitrogen !== null && latest.nitrogen !== undefined ? latest.nitrogen : 'no value available for this date'}\n`;
  reply += `Phosphorus: ${latest.phosphorus !== null && latest.phosphorus !== undefined ? latest.phosphorus : 'no value available for this date'}\n`;
  reply += `Potassium: ${latest.potassium !== null && latest.potassium !== undefined ? latest.potassium : 'no value available for this date'}\n`;
  reply += `pH: ${latest.ph !== null && latest.ph !== undefined ? latest.ph : 'no value available for this date'}`;

  return res.json({reply});
};

const getParcelStatus = async (req, res, next) => {
  const {parcelId, farmerId} = req;

  let result;
  try {
    result = await getParcelWithIndices(parcelId, farmerId, next);
  } catch (error) {
    return next(new HttpError('Unexpected error occurred', 500)); // for god knows what errors just to be sure
  }

  if (!result) { // if next was called in the helper
    return;
  }

  if (result.error) {
    return res.json({reply: result.error});
  }

  const {parcel, latest, indices} = result;

  if (!indices || indices.length === 0) {
    return res.json({
      reply: `Parcel ${parcel.id} - ${parcel.name} has no indices available yet.`
    });
  }

  // format the date from the latest indices
  const formattedDate = formatDate(latest.date);

  // status summary (rule-based + optional LLM) - pass date so it can be included
  const summary = await generateStatusSummary(indices, formattedDate);

  return res.json({
    reply: `Parcel ${parcel.id} – ${parcel.name}\n${summary}`
  });
};


exports.getAllParcels = getAllParcels;
exports.getParcelDetails = getParcelDetails;
exports.getParcelStatus = getParcelStatus;
exports.getParcelWithIndices = getParcelWithIndices;
