const Farmer = require('../models/farmers');
const HttpError = require('./../models/http-error');

const checkAccountLink = async (req, res, next) => {
  const {from} = req.body;

  try {
    const farmer = await Farmer.findByPhone(from);

    if (farmer) {
      req.isLinked = true;
      req.farmerId = farmer.id;
      return next();
    }

    req.isLinked = false;
    next();
  } catch (error) {
    next(new HttpError('Something went wrong, could not find phone!', 500));
  }
};

module.exports = checkAccountLink;