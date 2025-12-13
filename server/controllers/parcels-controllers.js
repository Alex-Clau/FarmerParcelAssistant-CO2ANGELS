const Parcels = require('./../models/parcels');
const ParcelIndices = require('./../models/parcel_indices');

const HttpError = require('./../models/http-error');
const generateStatusSummary = require("../services/llm/llm-summary-parcel-indices");

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
    return {error: 'You do not have access to this parcel.'};
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

  return res.json({reply: `You have ${parcels.length} ${parcels.length > 1 ? 'parcels:' : 'parcel:'} \n ${parcelList}`});
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

  let reply = `Parcel ${parcel.id} – ${parcel.name}\n`;
  reply += `Area: ${parcel.area_ha} ha\n`;
  reply += `Crop: ${parcel.crop}\n`;
  reply += `Latest indices (${latest.date}):\n`;
  reply += `NDVI: ${latest.ndvi || 'N/A'}\n`;
  reply += `NDMI: ${latest.ndmi || 'N/A'}\n`;
  reply += `NDWI: ${latest.ndwi || 'N/A'}\n`;
  reply += `SOC: ${latest.soc || 'N/A'}\n`;
  reply += `Nitrogen: ${latest.nitrogen || 'N/A'}\n`;
  reply += `Phosphorus: ${latest.phosphorus || 'N/A'}\n`;
  reply += `Potassium: ${latest.potassium || 'N/A'}\n`;
  reply += `pH: ${latest.ph || 'N/A'}`;

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

  const {parcel, indices} = result;

  if (!indices || indices.length === 0) {
    return res.json({
      reply: `Parcel ${parcel.id} - ${parcel.name} has no indices available yet.`
    });
  }

  // status summary (rule-based + optional LLM)
  const summary = await generateStatusSummary(indices);

  return res.json({
    reply: `Status of ${parcel.id} - ${parcel.name}:\n\n${summary}`
  });
};


exports.getAllParcels = getAllParcels;
exports.getParcelDetails = getParcelDetails;
exports.getParcelStatus = getParcelStatus;
exports.getParcelWithIndices = getParcelWithIndices;
