const {GoogleGenerativeAI} = require('@google/generative-ai');

let llmClient = null;
const isLLMEnabled = process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY;

if (isLLMEnabled) {
  llmClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const analyzeWithRules = (indices) => { // use always, llm is just enhancement
  const {ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph} = indices;
  const summary = [];

  // NDVI (Normalized Difference Vegetation Index)
  if (ndvi !== null && ndvi !== undefined) {
    if (ndvi > 0.75) {
      summary.push('NDVI is Very High, indicating extremely vigorous crop canopy');
    } else if (ndvi > 0.55) { // 0.55 - 0.75
      summary.push('NDVI is Good, indicating healthy, dense vegetation');
    } else if (ndvi > 0.30) { // 0.30 - 0.55
      summary.push('NDVI is Average, indicating developing vegetation with moderate health');
    } else { // 0.00 - 0.30
      summary.push('NDVI is Bad, indicating poor vegetation health, bare soil, or stressed crop');
    }
  }

  // NDMI (Moisture Index)
  if (ndmi !== null && ndmi !== undefined) {
    if (ndmi > 0.30) {
      summary.push('NDMI is Good, showing high moisture and healthy water content');
    } else if (ndmi >= 0.15) { // 0.15 - 0.30
      summary.push('NDMI is Average, showing moderate moisture');
    } else { // < 0.15
      summary.push('NDMI is Bad/Dry, indicating low moisture and possible drought stress');
    }
  }

  // NDWI (Water Index)
  if (ndwi !== null && ndwi !== undefined) {
    if (ndwi > 0.25) {
      summary.push('NDWI is Good, showing strong water presence');
    } else if (ndwi >= 0.10) { // 0.10 - 0.25
      summary.push('NDWI is Average, indicating moderate water content');
    } else { // < 0.10
      summary.push('NDWI is Bad, indicating low water presence');
    }
  }

  // SOC (Soil Organic Carbon)
  if (soc !== null && soc !== undefined) {
    if (soc > 2.5) {
      summary.push('SOC is High, indicating rich organic content');
    } else if (soc >= 1.5) { // 1.5 - 2.5
      summary.push('SOC is Moderate');
    } else { // < 1.5
      summary.push('SOC is Low/Bad, indicating poor soil organic matter');
    }
  }

  // Nitrogen (N)
  if (nitrogen !== null && nitrogen !== undefined) {
    if (nitrogen > 1.0) {
      summary.push('Nitrogen levels are High/Good');
    } else if (nitrogen >= 0.7) { // 0.7 - 1.0
      summary.push('Nitrogen levels are Adequate');
    } else { // < 0.7
      summary.push('Nitrogen levels are Low, and the crop may need fertilization');
    }
  }

  // Phosphorus (P)
  if (phosphorus !== null && phosphorus !== undefined) {
    if (phosphorus > 0.45) {
      summary.push('Phosphorus levels are High');
    } else if (phosphorus >= 0.35) { // 0.35 - 0.45
      summary.push('Phosphorus levels are Adequate');
    } else { // < 0.35
      summary.push('Phosphorus levels are Low');
    }
  }

  // Potassium (K)
  if (potassium !== null && potassium !== undefined) {
    if (potassium > 0.7) {
      summary.push('Potassium levels are High/Good');
    } else if (potassium >= 0.55) { // 0.55 - 0.7
      summary.push('Potassium levels are Adequate');
    } else { // < 0.55
      summary.push('Potassium levels are Low');
    }
  }

  // pH Level
  if (ph !== null && ph !== undefined) {
    if (ph > 7.0) { // > 7.0
      summary.push('Soil pH is Alkaline, which may cause nutrient availability issues');
    } else if (ph >= 6.0) { // 6.0 - 7.0
      summary.push('Soil pH is Good/Neutral, which is ideal for most crops');
    } else if (ph >= 5.5) { // 5.5 - 6.0
      summary.push('Soil pH is Slightly Acidic and acceptable');
    } else { // < 5.5
      summary.push('Soil pH is Bad/Acidic, which is problematic for most crops');
    }
  }

  return summary.join('. ') + (summary.length > 0 ? '.' : '');
};

const enhanceAnalysisWithLLM = async (indices, ruleBasedSummary) => {
  try {
    const model = llmClient.getGenerativeModel({model: process.env.GEMINI_MODEL});

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()
                   .trim();

  } catch (error) {
    console.error('LLM enhancement error:', error.message);
    return ruleBasedSummary; // fallback to ONLY rule-based
  }
};

const generateStatusSummary = async (indices) => {
  // always generate the rule-based summary first
  const ruleBasedSummary = analyzeWithRules(indices);

  // OPTIONALLY enhance with LLM
  if (isLLMEnabled) {
    return await enhanceAnalysisWithLLM(indices, ruleBasedSummary);
  }

  return ruleBasedSummary;
};

module.exports = generateStatusSummary;