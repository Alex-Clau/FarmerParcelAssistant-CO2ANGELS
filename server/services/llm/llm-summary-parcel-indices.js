const llmService = require('./llm-service');
const trendsParcelIndices = require('../trends-parcel-indices');
const summaryParcelIndices = require('../summary-parcel-indices');

const llmSummaryParcelIndices = async (indices, ruleBasedSummary, formattedDate) => {

  const prompt = `You are a farmer assistant. Based on these parcel indices and the rule-based analysis, provide a natural, conversational summary in 2-3 sentences.
  Indices:
  - NDVI: ${indices.ndvi || 'N/A'}
  - NDMI: ${indices.ndmi || 'N/A'}
  - NDWI: ${indices.ndwi || 'N/A'}
  - SOC: ${indices.soc || 'N/A'}%
  - Nitrogen: ${indices.nitrogen || 'N/A'}%
  - Phosphorus: ${indices.phosphorus || 'N/A'}%
  - Potassium: ${indices.potassium || 'N/A'}%
  - pH: ${indices.ph || 'N/A'}
  
  Measurement date: ${formattedDate}
  Rule-based analysis: ${ruleBasedSummary}
  
  Provide a friendly, natural-language summary that a farmer would understand. Keep it concise (2-3 sentences).
  IMPORTANT: End your summary with exactly this line: "Overall, the parcel [describe how it looks - e.g., 'healthy', 'in good condition', 'performing well', 'needs attention'] at the last measurement (${formattedDate})."`;

  const textResponse = await llmService(prompt);
  if (!textResponse) {
    return ruleBasedSummary;
  }
  return textResponse;
}

const generateStatusSummary = async (indicesArray, formattedDate) => {
  const latest = indicesArray[0];
  const ruleBasedSummary = summaryParcelIndices(latest); // always generate the rule-based summary first

  const trends = trendsParcelIndices(indicesArray);
  const trendsSummary = trends.length > 0 ? '\n' + trends.join('.\n') : '';

  let finalSummary = ruleBasedSummary + trendsSummary;

  if (process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY) {
    return await llmSummaryParcelIndices(latest, finalSummary, formattedDate);
  }

  // determine parcel status based on indices
  let statusDescription = 'in good condition';
  if (latest.ndvi !== null && latest.ndvi < 0.30) {
    statusDescription = 'needs attention';
  } else if (latest.ndvi !== null && latest.ndvi > 0.55 && latest.nitrogen !== null && latest.nitrogen >= 0.7) {
    statusDescription = 'healthy';
  } else if (latest.ndvi !== null && latest.ndvi > 0.55) {
    statusDescription = 'performing well';
  }

  return `${finalSummary}\n\nOverall, the parcel looks ${statusDescription} at the last measurement (${formattedDate}).`;
};

module.exports = generateStatusSummary;