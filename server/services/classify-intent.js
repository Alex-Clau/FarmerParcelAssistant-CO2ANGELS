const classifyIntent = (text) => { // fallback for llm
  const lowerText = text.toLowerCase()
                        .trim();

  const extractParcelId = (text) => {
    const match = text.match(/(?:^|\s)(?:parcel\s*)?p?(\d+)(?:\s|$)/i);
    return match ? `P${match[1]}` : null;
  };

  const parcelId = extractParcelId(lowerText);

  // list parcels
  if (lowerText.match(/(show|list|what).*parcel|parcel.*(list|show|all)/i)) {
    return {type: 'list_parcels'};
  }

  // parcel details
  if (parcelId && lowerText.match(/(detail|about|information|tell me)/i)) {
    return {type: 'parcel_details', parcelId};
  }

  // status summary
  if (parcelId && lowerText.match(/(how|status|summary)/i)) {
    return {type: 'parcel_status', parcelId};
  }

  // set the frequency of reports
  const freqMatch = lowerText.match(/(daily|weekly|monthly|every\s+\d+\s+days?)/i);
  if (lowerText.match(/(set|make).*(report|frequency)/i) && freqMatch) {
    let frequency = freqMatch[1].toLowerCase();

    return {type: 'set_frequency', frequency};
  }

  return {type: 'unknown'};
};

module.exports = classifyIntent;