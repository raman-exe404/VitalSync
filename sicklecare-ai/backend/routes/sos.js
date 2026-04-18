const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const twilio = require('twilio');

// POST /api/send-sos
router.post('/send-sos', async (req, res) => {
  const { user_id, latitude, longitude, name, phone } = req.body;

  let userName = name || 'Unknown Patient';
  let userPhone = phone || 'N/A';
  let userLocation = 'Unknown location';
  let emergencyContact = null;

  if (user_id && !String(user_id).startsWith('demo-')) {
    const { data: user } = await supabase
      .from('users')
      .select('name, phone, location, emergency_contact')
      .eq('id', user_id)
      .single();

    if (user) {
      userName = user.name || userName;
      userPhone = user.phone || userPhone;
      userLocation = user.location || userLocation;
      emergencyContact = user.emergency_contact || null;
    }
  }

  if (latitude && longitude) {
    userLocation = `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  // Must have an emergency contact to send SOS
  if (!emergencyContact) {
    return res.status(400).json({ error: 'No emergency contact found. Please add one in your profile.' });
  }

  // Ensure number has + prefix
  const toNumber = emergencyContact.startsWith('+') ? emergencyContact : `+${emergencyContact}`;

  const message = `SOS ALERT from VitalSync! Patient: ${userName} | Phone: ${userPhone} | Location: ${userLocation} | Please respond immediately.`;

  console.log('Sending SOS via Twilio to:', toNumber);

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log('Twilio SID:', result.sid);
    res.json({ success: true, message: `SOS sent to ${toNumber}`, sid: result.sid });
  } catch (err) {
    console.error('Twilio SOS error:', err.message);

    // Twilio trial account — number not verified
    if (err.code === 21608 || err.message?.includes('unverified')) {
      return res.status(202).json({
        success: false,
        trial: true,
        message: `SOS alert logged. SMS could not be delivered — ${toNumber} is not verified on your Twilio trial account. Please verify it at twilio.com/console or ask your admin to upgrade.`,
      });
    }

    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
