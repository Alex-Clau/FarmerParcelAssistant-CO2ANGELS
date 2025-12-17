const Farmer = require('../models/farmers');
const HttpError = require('../models/http-error');

const handleLinking = async (req, res, next) => {
  const {from, text} = req.body;
  const trimmedText = text.trim();
  const lowerText = trimmedText.toLowerCase();

  if (['help', 'support', 'human', 'agent'].includes(lowerText)) { // if the user needs help
    return res.json({
      reply: "To use this bot, you must link your account first. If you forgot your username, please contact support."
    });
  }

  if (lowerText.match(/^(hi|hello|greetings)\b/i)) { // greeting message if user greets bot
    return res.json({
      reply: 'Welcome to the CO2 Angels Farm Assistant! Your phone number is not linked to an account yet. Please type your username to link your account.'
    });
  }

  if (trimmedText.match(/^p\d+/i)) { // check if pid provided ex:'p1', 'P1'
    return res.json({
      reply: "I see you are looking for a parcel, but I need to know who you are first. Please type your username to link your account."
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
      // farmer already has a different phone number
      return res.json({
        reply: 'This phone number does not match your registered account.\nPlease use the phone number associated with your account or contact support.'
      });
    }

    // update farmer's phone from null to the provided phone
    try {
      await Farmer.update(farmer.id, {
        username: farmer.username,
        name: farmer.name,
        phone: from
      });
      
      return res.json({
        reply: `Great, ${farmer.name}! Your account has been linked to ${from}. You can now ask about your parcels, for example: "Show me my parcels" or "How is parcel P1?".`
      });
    } catch (error) {
      return next(new HttpError('Something went wrong, could not link your account!', 500));
    }

  } catch (error) {
    return next(new HttpError('Something went wrong, could not link your account!', 500));
  }
};

exports.handleLinking = handleLinking;