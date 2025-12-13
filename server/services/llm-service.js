const {GoogleGenerativeAI} = require('@google/generative-ai');

let client = null;
const isEnabled = process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY;

if (isEnabled) {
  client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const llmService = {
  async classifyIntent(text) {

    if (!isEnabled) {
      console.log('ye')
      return null; // return to regex fallback function
    }

    try {
      const model = client.getGenerativeModel({model: process.env.GEMINI_MODEL});
      const prompt = `You are a farmer assistant bot. Classify user messages into one of these intents:
      - list_parcels: User wants to see all their parcels
      - parcel_details: User wants details about a specific parcel (extract parcel ID like P1, P2, etc.)
      - parcel_status: User wants status/summary of a parcel (extract parcel ID)
      - set_frequency: User wants to set report frequency (extract frequency: daily, weekly, monthly, or "X days")
      
      Return ONLY valid JSON in this format:
      {"type": "list_parcels"}
      {"type": "parcel_details", "parcelId": "P1"}
      {"type": "parcel_status", "parcelId": "P2"}
      {"type": "set_frequency", "frequency": "daily"}
      {"type": "unknown"}
      
      Extract parcel IDs from text (P1, P2, P3, etc.). Extract frequency from text.
      
      User message: "${text}"
      
      Return only the JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      const parsed = JSON.parse(responseText);
      if (parsed.parcelId && !parsed.parcelId.startsWith('P')) {
        parsed.parcelId = `P${parsed.parcelId}`;
      }

      return parsed;
    } catch (error) {
      console.error('Gemini classification error:', error.message);
      return null; // null will trigger fallback
    }
  }
}

module.exports = llmService;