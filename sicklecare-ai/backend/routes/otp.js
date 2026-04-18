const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const supabase = require('../lib/supabase');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory OTP store { phone -> { otp, expires } }
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/otp/send
router.post('/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const formatted = phone.startsWith('+') ? phone : `+${phone}`;
  const otp = generateOTP();
  otpStore.set(formatted, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
    await client.messages.create({
      body: `Your VitalSync OTP is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatted,
    });
    console.log(`[OTP] Sent to ${formatted}`);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('[OTP] Send error:', err.message);
    // Twilio trial — number not verified, return OTP in response so user can still proceed
    if (err.code === 21608 || err.message?.includes('unverified')) {
      console.warn(`[OTP] TRIAL - code for ${formatted}: ${otp}`);
      return res.status(202).json({
        trial: true,
        devOtp: otp,
        message: `Twilio trial account: ${formatted} is not verified. Use the OTP shown on screen to continue.`,
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/otp/verify
router.post('/verify', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  const formatted = phone.startsWith('+') ? phone : `+${phone}`;
  const record = otpStore.get(formatted);

  if (!record) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
  if (Date.now() > record.expires) {
    otpStore.delete(formatted);
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }
  if (record.otp !== otp.toString()) {
    return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
  }
  otpStore.delete(formatted);

  try {
    // 1. Check our users table first (fastest, no auth admin needed)
    const { data: profileRow } = await supabase
      .from('users')
      .select('id, role')
      .eq('phone', formatted)
      .single();

    if (profileRow) {
      // Existing user — return their ID directly
      console.log(`[OTP] Existing user: ${profileRow.id}`);
      return res.json({ success: true, userId: profileRow.id, phone: formatted, isNewUser: false, role: profileRow.role });
    }

    // 2. No profile row — check if a stale auth user exists for this phone
    const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const stripped = formatted.replace(/^\+/, '');
    const existingAuth = authList?.users?.find(u => u.phone === stripped || u.phone === formatted);

    // Stale auth user (profile deleted) — reuse their ID and send to register
    if (existingAuth) {
      console.log(`[OTP] Stale auth user found, reusing for re-registration: ${existingAuth.id}`);
      return res.json({ success: true, userId: existingAuth.id, phone: formatted, isNewUser: true });
    }

    // Brand new user — create auth entry
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      phone: formatted,
      phone_confirm: true,
    });
    if (createErr) {
      console.error('[OTP] Create user error:', createErr.message);
      // Last resort: scan again in case of race condition
      const { data: retryList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const found = retryList?.users?.find(u => u.phone === formatted);
      if (found) return res.json({ success: true, userId: found.id, phone: formatted, isNewUser: true });
      return res.status(500).json({ error: createErr.message });
    }
    const userId = created.user.id;
    console.log(`[OTP] New auth user created: ${userId}`);

    res.json({ success: true, userId, phone: formatted, isNewUser: true });
  } catch (err) {
    console.error('[OTP] Verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/otp/cleanup  — dev utility: delete stale auth user by phone
router.post('/cleanup', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  // Supabase stores phone without + prefix, match both formats
  const stripped = phone.replace(/^\+/, '');
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const found = authList?.users?.find(u => u.phone === stripped || u.phone === `+${stripped}`);
  if (!found) return res.json({ message: 'No auth user found for this number' });
  const { error } = await supabase.auth.admin.deleteUser(found.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: `Deleted auth user ${found.id} for ${phone}` });
});

module.exports = router;
