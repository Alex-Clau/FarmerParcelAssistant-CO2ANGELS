const llmService = require('./llm-service');

const llmClassifyIntent = async (text) => {

  const prompt = `You are a farmer assistant bot. Classify user messages into one of these intents:
  - list_parcels: User wants to see all their parcels
  - parcel_details: User wants details about a specific parcel (extract parcel ID like P1, P2, etc.)
  - parcel_status: User wants status/summary of a parcel (extract parcel ID)
  - set_frequency: User wants to set report frequency (extract frequency: daily, weekly, monthly, or "X days") (ONLY THOSE FREQUENCIES ALLOWED)
  
  Return ONLY valid JSON in this format:
  {"type": "list_parcels"}
  {"type": "parcel_details", "parcelId": "P1"}
  {"type": "parcel_status", "parcelId": "P2"}
  {"type": "set_frequency", "frequency": "daily"}
  {"type": "unknown"}
  
  Extract the first substring from the text that matches the pattern: the letter P (case-insensitive) followed immediately by one or more digits.
  Extract frequency from text.
  
  User message: "${text}"
  
  Return only the JSON, no other text.`;

  const textResponse = await llmService(prompt);
  if (!textResponse) {
    return null; // something went wrong
  }

  const parsed = JSON.parse(textResponse);
  if (parsed.parcelId) {
    const normalized = parsed.parcelId.replace(/^[Pp]/, ''); // remove P or p if present
    parsed.parcelId = `P${normalized}`; // always add uppercase P
  }

  return parsed;
}

module.exports = llmClassifyIntent;