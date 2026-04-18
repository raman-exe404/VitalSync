const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/weather?lat=xx&lng=xx
router.get('/weather', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon: lng,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    res.json({
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      city: data.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
