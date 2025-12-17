const summaryWithRules = (indices) => { // use always, llm is just enhancement
  const {ndvi, ndmi, ndwi, soc, nitrogen, phosphorus, potassium, ph} = indices;
  const summary = [];

  // vegetation section
  if (ndvi !== null && ndvi !== undefined) {
    const ndviNum = Number(ndvi);
    if (!isNaN(ndviNum)) {
      if (ndviNum > 0.75) {
        summary.push(`Vegetation is very strong (NDVI ≈ ${ndviNum.toFixed(2)})`);
      } else if (ndviNum > 0.55) {
        summary.push(`Vegetation is healthy (NDVI ≈ ${ndviNum.toFixed(2)})`);
      } else if (ndviNum > 0.30) {
        summary.push(`Vegetation is developing (NDVI ≈ ${ndviNum.toFixed(2)})`);
      } else {
        summary.push(`Vegetation needs attention (NDVI ≈ ${ndviNum.toFixed(2)})`);
      }
    }
  }

  // moisture and water section (grouped together)
  let ndmiStatus = null;
  let ndwiStatus = null;
  
  if (ndmi !== null && ndmi !== undefined) {
    if (ndmi > 0.30) {
      ndmiStatus = 'good';
    } else if (ndmi >= 0.15) {
      ndmiStatus = 'moderate';
    } else {
      ndmiStatus = 'low';
    }
  }
  if (ndwi !== null && ndwi !== undefined) {
    if (ndwi > 0.25) {
      ndwiStatus = 'acceptable';
    } else if (ndwi >= 0.10) {
      ndwiStatus = 'moderate';
    } else {
      ndwiStatus = 'low';
    }
  }
  
  if (ndmiStatus && ndwiStatus) {
    summary.push(`Soil moisture (NDMI) is ${ndmiStatus}, and water index (NDWI) is ${ndwiStatus}`);
  } else if (ndmiStatus) {
    summary.push(`Soil moisture (NDMI) is ${ndmiStatus}`);
  } else if (ndwiStatus) {
    summary.push(`Water index (NDWI) is ${ndwiStatus}`);
  }

  // soil nutrients section (separate)
  if (nitrogen !== null && nitrogen !== undefined) {
    const nitrogenNum = Number(nitrogen);
    if (!isNaN(nitrogenNum)) {
      if (nitrogenNum > 1.0) {
        summary.push(`Nitrogen levels are high (≈${nitrogenNum.toFixed(2)})`);
      } else if (nitrogenNum >= 0.7) {
        summary.push(`Nitrogen levels are adequate (≈${nitrogenNum.toFixed(2)})`);
      } else {
        summary.push(`Nitrogen levels are low (≈${nitrogenNum.toFixed(2)}), and the crop may need fertilization`);
      }
    }
  }

  if (phosphorus !== null && phosphorus !== undefined) {
    const phosphorusNum = Number(phosphorus);
    if (!isNaN(phosphorusNum)) {
      if (phosphorusNum > 0.45) {
        summary.push(`Phosphorus levels are high (≈${phosphorusNum.toFixed(2)})`);
      } else if (phosphorusNum >= 0.35) {
        summary.push(`Phosphorus levels are adequate (≈${phosphorusNum.toFixed(2)})`);
      } else {
        summary.push(`Phosphorus levels are low (≈${phosphorusNum.toFixed(2)})`);
      }
    }
  }

  if (potassium !== null && potassium !== undefined) {
    const potassiumNum = Number(potassium);
    if (!isNaN(potassiumNum)) {
      if (potassiumNum > 0.7) {
        summary.push(`Potassium levels are high (≈${potassiumNum.toFixed(2)})`);
      } else if (potassiumNum >= 0.55) {
        summary.push(`Potassium levels are adequate (≈${potassiumNum.toFixed(2)})`);
      } else {
        summary.push(`Potassium levels are low (≈${potassiumNum.toFixed(2)})`);
      }
    }
  }

  // pH section
  if (ph !== null && ph !== undefined) {
    const phNum = Number(ph);
    if (!isNaN(phNum)) {
      if (phNum > 7.0) {
        summary.push(`Soil pH is around ${phNum.toFixed(1)}, which may cause nutrient availability issues`);
      } else if (phNum >= 6.0) {
        summary.push(`Soil pH is around ${phNum.toFixed(1)}, which is suitable for most crops`);
      } else if (phNum >= 5.5) {
        summary.push(`Soil pH is around ${phNum.toFixed(1)}, which is slightly acidic but acceptable`);
      } else {
        summary.push(`Soil pH is around ${phNum.toFixed(1)}, which is problematic for most crops`);
      }
    }
  }

  return summary.join('.\n') + (summary.length > 0 ? '.' : '');
};

module.exports = summaryWithRules;