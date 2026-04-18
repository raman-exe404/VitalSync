const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { predictRisk } = require('../lib/riskEngine');
const axios = require('axios');

// Fetch humidity from weather API for the user's location (best-effort)
async function getHumidity(lat, lng) {
  try {
    if (!lat || !lng || !process.env.OPENWEATHER_API_KEY) return 50;
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' },
      timeout: 4000
    });
    return data.main.humidity || 50;
  } catch {
    return 50;
  }
}

// POST /api/health-log
router.post('/health-log', async (req, res) => {
  const { user_id, water, sleep, stress, pain, temperature, symptoms, latitude, longitude } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  // Save log to DB
  const { data: log, error } = await supabase
    .from('health_logs')
    .insert([{ user_id, water, sleep, stress, pain, temperature, symptoms }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Fetch user genotype for ML model
  let genotype = 'HbSS';
  const { data: userRow } = await supabase
    .from('users')
    .select('genotype')
    .eq('id', user_id)
    .single();
  if (userRow?.genotype) genotype = userRow.genotype;

  // Get humidity from weather if coords provided
  const humidity = await getHumidity(latitude, longitude);

  // Run ML prediction (falls back to rules if ML is down)
  const risk = await predictRisk({ water, sleep, stress, pain, temperature }, genotype, humidity);

  // Save alert
  await supabase.from('alerts').insert([{
    user_id,
    risk_level: risk.level,
    message: risk.message,
    is_read: false
  }]);

  res.json({ log, risk });
});

// GET /api/health-logs?user_id=xxx
router.get('/health-logs', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
