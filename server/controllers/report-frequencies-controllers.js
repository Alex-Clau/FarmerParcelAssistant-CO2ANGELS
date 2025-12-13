const ReportFrequency = require('../models/report_frequency');
const HttpError = require('../models/http-error');

const setFrequency = async (req, res, next) => {
  const { frequency } = req; // from message-controllers
  const farmerId = req.farmerId;

  if (!frequency) {
    return res.json({
      reply: 'Please specify a frequency. Examples: "daily", "weekly", "2 days", "monthly"'
    });
  }

  let trimmedFreq = frequency.toLowerCase().trim();

  // map some common variations
  if (trimmedFreq === 'every day' || trimmedFreq === 'each day') {
    trimmedFreq = 'daily';
  } else if (trimmedFreq === 'every week' || trimmedFreq === 'weekly') {
    trimmedFreq = 'weekly';
  } else if (trimmedFreq === 'every month' || trimmedFreq === 'monthly') {
    trimmedFreq = 'monthly';
  }

  try {
    const existing = await ReportFrequency.findByFarmerId(farmerId); // create new freq or update old one

    if (existing) {
      await ReportFrequency.update(farmerId, { frequency: trimmedFreq });
    } else {
      await ReportFrequency.create({ farmer_id: farmerId, frequency: trimmedFreq });
    }

    return res.json({
      reply: `Your report frequency has been set to ${trimmedFreq}. You will receive reports accordingly.`
    });
  } catch (error) {
    return next(new HttpError('Something went wrong setting your report frequency.', 500));
  }
};

exports.setFrequency = setFrequency;