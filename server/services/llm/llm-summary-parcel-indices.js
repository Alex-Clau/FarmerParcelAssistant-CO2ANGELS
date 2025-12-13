const llmService = require('./llm-service');
const trendsParcelIndices = require('../trends-parcel-indices');
const summaryParcelIndices = require('../summary-parcel-indices');

const llmSummaryParcelIndices = async (indices, ruleBasedSummary) => {

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
  
  Rule-based analysis: ${ruleBasedSummary}
  Provide a friendly, natural-language summary that a farmer would understand. Keep it concise (2-3 sentences).`;

  const textResponse = await llmService(prompt);
  if (!textResponse) {
    return ruleBasedSummary;
  }
  return textResponse;
}

const generateStatusSummary = async (indicesArray) => {
  const latest = indicesArray[0];
  const ruleBasedSummary = summaryParcelIndices(latest); // always generate the rule-based summary first

  const trends = trendsParcelIndices(indicesArray);
  const trendsSummary = trends.length > 0 ? '\n' + trends.join('. ') : '';

  let finalSummary = ruleBasedSummary + trendsSummary;

  if (process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY) {
    return await llmSummaryParcelIndices(latest, finalSummary);
  }

  return finalSummary;
};

module.exports = generateStatusSummary;