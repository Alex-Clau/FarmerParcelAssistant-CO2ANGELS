const Farmer = require('../models/farmers');
const HttpError = require('../models/http-error');

const handleLinking = async (req, res, next) => {
  const {from, text} = req.body;
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


    if (farmer.phone && farmer.phone !== from) {
      // Farmer already has a different phone number
      return res.json({
        reply: 'This phone number does not match your registered account.\nPlease use the phone number associated with your account or contact support.'
      });
    }

    // Update farmer's phone from null to the provided phone
    try {
      await Farmer.update(farmer.id, {
        username: farmer.username,
        name: farmer.name,
        phone: from
      });
      
      return res.json({
        reply: `Account linked successfully! Welcome ${farmer.name}.\nYou can now ask me about your parcels.`
      });
    } catch (error) {
      return next(new HttpError('Something went wrong, could not link your account!', 500));
    }

  } catch (error) {
    return next(new HttpError('Something went wrong, could not link your account!', 500));
  }
};

exports.handleLinking = handleLinking;