const Farmer = require('../models/farmers');
const PhoneLink = require('../models/phone_link');
const HttpError = require('../models/http-error');

const handleLinking = async (req, res, next) => {
  const { from, text } = req.body;
  const trimmedText = text.trim();
  const lowerText = trimmedText.toLowerCase();

  const isGreeting = !trimmedText ||
    trimmedText.length === 0 ||
    lowerText === 'hi' ||
    lowerText === 'hello';

  if (isGreeting) {
    return res.json({
      reply: 'Welcome! Please type your username to link your account.'
    });
  }

  try {
    const farmer = await Farmer.findByUsername(trimmedText); // treat input as a possible username

    if (!farmer) {
      return res.json({
        reply: 'Username not found. Please type your username to link your account.'
      });
    }

    if (farmer.phone && farmer.phone !== from) { // verify phone matches (if the farmer has a phone registered)
      return res.json({
        reply: 'This phone number does not match your registered account. Please use the phone number associated with your account or contact support.'
      });
    }

    await PhoneLink.create({ phone: from, farmer_id: farmer.id });

    return res.json({
      reply: `Great, your account has been linked to ${from}. You can now ask about your parcels.`
    });
  } catch (error) {
    if (error.code === '23505') { // unique constraint violation code from postgreSQL
      return res.json({
        reply: 'Your account is already linked. You can now ask about your parcels.'
      });
    }
    return next(error);
  }
};

exports.handleLinking = handleLinking;