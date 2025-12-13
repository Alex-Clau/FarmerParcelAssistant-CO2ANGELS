const {GoogleGenerativeAI} = require('@google/generative-ai');

let client = null;
const isEnabled = process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY;

if (isEnabled) {
  client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const llmService = async (prompt) => {
  if (!isEnabled) {
    return null; // back to fallback function
  }

  try {
    const model = client.getGenerativeModel({model: process.env.GEMINI_MODEL || 'gemini-pro'});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text()
                                 .trim();

    return textResponse;
  } catch (error) {
    console.error('Gemini classification error:', error.message);
    return null; // null will trigger fallback
  }
}

module.exports = llmService;