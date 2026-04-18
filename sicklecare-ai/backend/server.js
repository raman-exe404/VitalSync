require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  credentials: false,
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
