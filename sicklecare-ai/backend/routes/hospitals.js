const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/nearby-hospitals?lat=xx&lng=xx
router.get('/nearby-hospitals', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  // Try Google Places API (New) first
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const { data } = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          includedTypes: ['hospital', 'doctor'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
              radius: 5000.0
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours,places.nationalPhoneNumber'
          }
        }
      );

      if (data.places?.length) {
        return res.json(data.places.map(h => ({
          name: h.displayName?.text || 'Unknown',
          address: h.formattedAddress || '',
          rating: h.rating || null,
          lat: h.location?.latitude,
          lng: h.location?.longitude,
          open: h.currentOpeningHours?.openNow ?? null,
          phone: h.nationalPhoneNumber || null,
          source: 'google'
        })));
      }
    } catch (err) {
      console.warn('Google Places API failed, falling back to OpenStreetMap:', err.response?.data?.error?.message || err.message);
    }
  }

  // Fallback: OpenStreetMap Overpass API (free, no key needed)
  try {
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        node["amenity"="clinic"](around:5000,${lat},${lng});
        way["amenity"="hospital"](around:5000,${lat},${lng});
      );
      out center 10;
    `;

    const { data } = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 12000 }
    );

    const hospitals = (data.elements || []).map(el => ({
      name: el.tags?.name || el.tags?.['name:en'] || 'Hospital',
      address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Nearby',
      rating: null,
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
      open: null,
      phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
      source: 'openstreetmap'
    })).filter(h => h.lat && h.lng);

    return res.json(hospitals);
  } catch (err) {
    console.error('OpenStreetMap fallback error:', err.message);
    res.status(500).json({ error: 'Could not fetch nearby hospitals. Please try again.' });
  }
});

module.exports = router;
