const classifyIntent = (text) => { // fallback for llm
  const lowerText = text.toLowerCase()
                        .trim();

  const extractParcelId = (text) => {
    const match = text.match(/p(\d+)/i); // looks strictly for 'p/P + digits'
    return match ? `P${match[1]}` : null;
  };

  const parcelId = extractParcelId(lowerText);

  // list parcels
  if (lowerText.match(/(show|list|what).*parcels|parcels.*(list|show|all)/i)) {
    return {type: 'list_parcels'};
  }

  // parcel details
  if (parcelId && lowerText.match(/(detail|about|information|tell me)/i)) {
    return {type: 'parcel_details', parcelId};
  }

  // status summary
  if (parcelId && lowerText.match(/(how\s+is|status|summary|)/i)) {
    return {type: 'parcel_status', parcelId};
  }

  // set the frequency of reports
  if (lowerText.match(/(set|make).*(report|reports|frequency)/i)) {
    const freqMatch = lowerText.match(/(daily|weekly|monthly|\d+\s+days?)/i);
    if (freqMatch) {
      let frequency = freqMatch[1].toLowerCase();
      return {type: 'set_frequency', frequency};
    } else {
      // user  didn't provide a valid frequency
      const afterTo = lowerText.match(/(?:to|in|frequency)\s+(\w+)/i);
      const invalidFrequency = afterTo ? afterTo[1] : '';
      return {type: 'set_frequency', frequency: invalidFrequency || null};
    }
  }

  return {type: 'unknown'};
};

module.exports = classifyIntent;