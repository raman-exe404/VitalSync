const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Genotype normalisation — map DB values to ML model's expected labels
const GENOTYPE_MAP = {
  'SS': 'HbSS', 'SC': 'HbSC', 'AS': 'HbAS',
  'AA': 'HbAA', 'CC': 'HbCC',
  'HbSS': 'HbSS', 'HbSC': 'HbSC', 'HbAS': 'HbAS',
  'HbAA': 'HbAA', 'HbCC': 'HbCC'
};

const RISK_MESSAGES = {
  HIGH:   'High crisis risk detected by AI model. Seek medical attention immediately. Stay hydrated and rest.',
  MEDIUM: 'Moderate risk detected. Drink more water, reduce stress, and monitor your symptoms closely.',
  LOW:    'Low risk. Your vitals look stable today. Keep up the healthy habits!'
};

/**
 * Rule-based fallback (used when ML service is unavailable)
 */
function ruleBasedRisk({ water, stress, temperature }) {
  if (water < 2 && stress > 7 && temperature < 15) return 'HIGH';
  if (water < 3 || stress > 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Main risk prediction — calls ML service, falls back to rules
 * @param {object} log  - health log fields
 * @param {string} genotype - patient genotype (optional)
 * @param {number} humidity - from weather API (optional)
 */
async function predictRisk(log, genotype = 'HbSS', humidity = 50) {
  const { water, sleep, stress, pain, temperature } = log;

  const mlGenotype = GENOTYPE_MAP[genotype] || 'HbSS';

  try {
    const { data } = await axios.post(
      `${ML_URL}/predict`,
      {
        water_intake: water,
        sleep_hours:  sleep,
        stress_level: stress,
        pain_level:   pain,
        temperature:  temperature,
        humidity:     humidity,
        genotype:     mlGenotype
      },
      { timeout: 5000 }
    );

    const level = data.risk || 'LOW';
    console.log(`[ML] Prediction: ${level} (genotype: ${mlGenotype})`);
    return { level, message: RISK_MESSAGES[level] || RISK_MESSAGES.LOW, source: 'ml' };

  } catch (err) {
    // ML service down — fall back to rule-based
    console.warn('[ML] Service unavailable, using rule-based fallback:', err.message);
    const level = ruleBasedRisk({ water, stress, temperature });
    return { level, message: RISK_MESSAGES[level], source: 'rules' };
  }
}

module.exports = { predictRisk };
