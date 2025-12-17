const ReportFrequency = require('../models/report_frequencies');
const Parcels = require('../models/parcels');
const HttpError = require('../models/http-error');
const generateStatusSummary = require('../services/llm/llm-summary-parcel-indices');
const {getParcelWithIndices} = require('./parcels-controllers');
const formatDate = require('../services/format-date');

const parseFrequencyToInt = (frequency) => {
  const freq = frequency.toLowerCase()
                        .trim();

  if (freq === 'daily' || freq === 'every day' || freq === 'each day') {
    return 1;
  } else if (freq === 'weekly' || freq === 'every week') {
    return 7;
  } else if (freq === 'monthly' || freq === 'every month') {
    return 30;
  }

  const match = freq.match(/(\d+)\s*days?/); // extract number of days
  if (match) {
    return parseInt(match[1]);
  }

  return null; // invalid frequency
};

const setFrequency = async (req, res, next) => {
  const {frequency} = req; // from message-controllers
  const farmerId = req.farmerId;

  // Check if frequency is missing entirely
  if (!frequency || (typeof frequency === 'string' && frequency.trim() === '')) {
    return res.json({
      reply: 'Please specify a frequency. Examples: "daily", "weekly", "2 days", "monthly"'
    });
  }

  const daysBetweenReports = parseFrequencyToInt(frequency);

  // If frequency was provided but is invalid, show the specific error message
  if (!daysBetweenReports) {
    return res.json({
      reply: 'Invalid frequency. Please use: "daily", "weekly", "monthly", or "X days" (e.g., "2 days")'
    });
  }

  const nextReportDate = new Date();
  nextReportDate.setDate(nextReportDate.getDate() + daysBetweenReports); // set the date of nextReportDate

  try {
    const existing = await ReportFrequency.findByFarmerId(farmerId);

    if (existing) {
      await ReportFrequency.update(farmerId, {
        frequency: daysBetweenReports,
        next_report: nextReportDate
      });
    } else {
      await ReportFrequency.create({
        farmer_id: farmerId,
        frequency: daysBetweenReports,
        next_report: nextReportDate
      });
    }

    // get parcel count for the message
    let parcels;
    try {
      parcels = await Parcels.findByFarmerId(farmerId);
    } catch (error) {
      // continue without the count if no parcels
      parcels = [];
    }

    const parcelCount = parcels ? parcels.length : 0;

    // format frequency string for user-friendly reply
    let reply;
    if (daysBetweenReports === 1) {
      reply = `Okay! I've set your report frequency to daily.`;
      if (parcelCount > 0) {
        reply += ` I'll include all ${parcelCount} ${parcelCount === 1 ? 'parcel' : 'parcels'} in your daily summary.`;
      }
    } else if (daysBetweenReports === 7) {
      reply = `Got it! I'll prepare a parcel summary for you every week based on your latest available data.`;
    } else if (daysBetweenReports === 30) {
      reply = `Got it! I'll prepare a parcel summary for you every month based on your latest available data.`;
    } else {
      reply = `Got it! I'll prepare a parcel summary for you every ${daysBetweenReports} days based on your latest available data.`;
    }

    return res.json({ reply });
  } catch (error) {
    return next(new HttpError('Something went wrong setting your report frequency.', 500));
  }
};

const getAllDueToday = async (req, res, next) => {
  let reports;
  try {
    reports = await ReportFrequency.findAllDue(new Date());
  } catch (error) {
    return next(new HttpError('Something went wrong returning all reports due today.', 500));
  }

  const newReports = await Promise.all(
    reports.map(async (report) => {
      try {
        const parcels = await Parcels.findByFarmerId(report.farmer_id);

        if (!parcels || parcels.length === 0) {
          return {
            to: report.phone,
            message: 'Your weekly parcel report:\nYou have no parcels registered yet.'
          };
        }

        // generate summaries for all parcels
        const parcelSummaries = await Promise.all(
          parcels.map(async (parcel) => {
            try {
              const result = await getParcelWithIndices(parcel.id, report.farmer_id, () => {
              }); // no next function cuz we are in a map function, so we handle errors in the try-catch

              if (!result || result.error || !result.latest) {
                return `For parcel ${parcel.id}:\nNo data available yet.`;
              }

              const formattedDate = formatDate(result.latest.date);
              const summary = await generateStatusSummary(result.indices, formattedDate);

              return `For parcel ${parcel.id}:\n${summary}`;
            } catch (err) {
              console.error(`Error generating summary for parcel ${parcel.id}:`, err);
              return `For parcel ${parcel.id}:\nUnable to generate summary.`;
            }
          })
        );

        // update next_report
        const nextReportDate = new Date(); // new Date(report.next_report) -> could be safer but has it's downsides (if update fails or the report is missed, date wil be derailed)
        nextReportDate.setDate(nextReportDate.getDate() + report.frequency);

        await ReportFrequency.update(report.farmer_id, {
          frequency: report.frequency,
          next_report: nextReportDate
        });

        return {
          to: report.phone,
          message: `Your weekly parcel report:\n\n${parcelSummaries.join('\n\n')}`
        };
      } catch (err) {
        console.error(`Error generating report for farmer ${report.farmer_id}:`, err);
        return null;
      }
    })
  );

  return res.json(newReports.filter(report => report !== null));
}

exports.setFrequency = setFrequency;
exports.getAllDueToday = getAllDueToday;
exports.parseFrequencyToInt = parseFrequencyToInt; 