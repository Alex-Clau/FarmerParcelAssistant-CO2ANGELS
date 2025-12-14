const ReportFrequency = require('../models/report_frequencies');
const Parcels = require('../models/parcels');
const HttpError = require('../models/http-error');
const generateStatusSummary = require('../services/llm/llm-summary-parcel-indices');
const {getParcelWithIndices} = require('./parcels-controllers');

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

    // format frequency string for user-friendly reply
    const frequencyString = daysBetweenReports === 1 ? 'daily' :
      daysBetweenReports === 7 ? 'weekly' :
        daysBetweenReports === 30 ? 'monthly' :
          `every ${daysBetweenReports} days`;

    return res.json({
      reply: `Your report frequency has been set to ${frequencyString}. You will receive reports accordingly.`
    });
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

        const parcel = parcels[0];

        const result = await getParcelWithIndices(parcel.id, report.farmer_id, () => {
        }); // no next function cuz we are in a map function, so we handle errors in the try-catch

        if (!result || result.error || !result.latest) {
          return {
            to: report.phone,
            message: `Your weekly parcel report:\nParcel ${parcel.id} has no data available yet.`
          };
        }

        const summary = await generateStatusSummary(result.indices);

        // update next_report
        const nextReportDate = new Date(report.next_report);
        nextReportDate.setDate(nextReportDate.getDate() + report.frequency);

        await ReportFrequency.update(report.farmer_id, {
          frequency: report.frequency,
          next_report: nextReportDate
        });

        return {
          to: report.phone,
          message: `Your weekly parcel report:\nFor parcel ${parcel.id}:\n${summary}`
        };
      } catch (error) {
        console.error(`Error generating report for farmer ${report.farmer_id}:`, error);
        return null;
      }
    })
  );

  return res.json(newReports.filter(report => report !== null));
}

exports.setFrequency = setFrequency;
exports.getAllDueToday = getAllDueToday;