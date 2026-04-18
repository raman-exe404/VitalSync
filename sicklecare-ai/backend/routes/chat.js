const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// OpenRouter client using OpenAI SDK compatibility
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://vitalsync.app',
    'X-Title': 'VitalSync SickleCare AI',
  },
});

// POST /api/chat
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful health assistant for sickle cell disease patients. Give simple, clear, and compassionate advice. Always recommend consulting a doctor for serious symptoms.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 300
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
