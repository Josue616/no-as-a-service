const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON
const reasonsEn = JSON.parse(fs.readFileSync('./reasons.json', 'utf-8'));
const reasonsEs = JSON.parse(fs.readFileSync('./razones.json', 'utf-8'));

// Rate limiter: 120 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  keyGenerator: (req, res) => {
    return req.headers['cf-connecting-ip'] || req.ip; // Fallback if header missing (or for non-CF)
  },
  message: { error: "Too many requests, please try again later. (120 reqs/min/IP)" }
});

app.use(limiter);

// Random rejection reason endpoint
app.get('/no', (req, res) => {
  const lang = req.query.lang?.toLowerCase() || 'en'; // default english

  let selectedReasons;

  if (lang === 'es') {
    selectedReasons = reasonsEs;
  } else {
    selectedReasons = reasonsEn;
  }

  const reason = selectedReasons[Math.floor(Math.random() * selectedReasons.length)];

  res.json({ reason });
});

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
});
