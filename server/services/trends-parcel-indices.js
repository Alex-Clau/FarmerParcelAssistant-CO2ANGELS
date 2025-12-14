const trendsParcelIndices = (indices) => {
  if (!indices || indices.length < 2) {
    return [];
  }

  const latest = indices[0];
  const previous = indices[1];
  const oldest = indices[indices.length - 1]; // first measurement
  const trends = [];

  // NDVI: Overall trend (start -> now)
  if (latest.ndvi !== null && oldest.ndvi !== null) {
    const overallChange = latest.ndvi - oldest.ndvi;
    if (overallChange > 0.1) {
      trends.push('NDVI has improved since the start');
    } else if (overallChange < -0.1) {
      trends.push('NDVI has declined since the start');
    }
  }

  // NDVI: Recent trend (latest -> previous)
  if (latest.ndvi !== null && previous.ndvi !== null) {
    const recentChange = latest.ndvi - previous.ndvi;
    if (recentChange > 0.05) {
      trends.push('NDVI is increasing recently, indicating improving vegetation');
    } else if (recentChange < -0.05) {
      trends.push('NDVI is decreasing recently, indicating declining vegetation health');
    }
  }

  // Nitrogen: 3-week trend (if available)
  if (indices.length >= 3) {
    const threeWeeksAgo = indices[2];
    if (latest.nitrogen !== null && threeWeeksAgo.nitrogen !== null) {
      const change = latest.nitrogen - threeWeeksAgo.nitrogen;
      if (change < -0.1) {
        trends.push('Nitrogen has decreased over 3 weeks, indicating potential nutrient depletion');
      }
    }
  }

  // Nitrogen: Overall trend (start -> now)
  if (latest.nitrogen !== null && oldest.nitrogen !== null) {
    const overallChange = latest.nitrogen - oldest.nitrogen;
    if (overallChange < -0.15) {
      trends.push('Nitrogen has significantly decreased since the start, indicating long-term nutrient depletion');
    }
  }


  return trends;
};

module.exports = trendsParcelIndices;