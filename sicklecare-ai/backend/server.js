require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // set this on Render to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api', require('./routes/healthLog'));
app.use('/api', require('./routes/alerts'));
app.use('/api', require('./routes/sos'));
app.use('/api', require('./routes/hospitals'));
app.use('/api', require('./routes/chat'));
app.use('/api', require('./routes/weather'));
app.use('/api/otp', require('./routes/otp'));

app.get('/', (req, res) => res.json({ status: 'SickleCare AI API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
