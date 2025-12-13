const PhoneLink = require('../models/phone_link');

const HttpError = require('./../models/http-error');

const checkAccountLink = async (req, res, next) => {
  const {from} = req.body;

  try {
    const phoneLink = await PhoneLink.findByPhone(from);

    if (!phoneLink) { // user not linked
      req.isLinked = false;
      return next();
    }

    req.isLinked = true; // user linked
    req.farmerId = phoneLink.farmer_id;
    next();
  } catch (error) {
    next(new HttpError('Something went wrong, could not find phone!', 500));
  }
};

module.exports = checkAccountLink;