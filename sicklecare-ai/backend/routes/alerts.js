const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET /api/alerts?user_id=xxx
router.get('/alerts', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/alerts/:id/read
router.patch('/alerts/:id/read', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
