# VitalSync

An AI-powered healthcare platform built for sickle cell disease patients and health workers. VitalSync combines real-time health monitoring, machine learning-based crisis prediction, emergency response, and medical record management into a single mobile-first web application.

---

## What it does

- **AI Crisis Prediction** — A Random Forest model analyzes daily health inputs (hydration, sleep, stress, pain, temperature, humidity, genotype) and predicts LOW / MEDIUM / HIGH crisis risk
- **Emergency SOS** — One-tap SOS sends an SMS alert with the patient's name, phone number, and live GPS location to their emergency contact
- **Nearby Hospitals** — Finds hospitals within 5km using Google Places API with an OpenStreetMap fallback
- **AI Health Chat** — Claude Haiku via OpenRouter answers health questions with compassionate, medically-aware responses
- **Real-time Alerts** — Supabase Realtime pushes risk alerts to the dashboard instantly after each health log
- **Medical Records** — Full health history with PDF export and custom date range filtering
- **Digital Twin** — Patient profile with genotype, stroke history, and days-since-last-crisis tracker
- **Doctor Dashboard** — Health worker view for monitoring patients
- **PWA** — Installable on Android and iOS, works offline with cached data
- **Google OAuth + Email Auth** — Secure authentication via Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| ML Service | Python, Flask, scikit-learn (Random Forest) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| SMS | Twilio |
| AI Chat | OpenRouter — Claude Haiku |
| Weather | OpenWeatherMap |
| Maps | Google Places API + OpenStreetMap fallback |

---

## Project Structure

```
VitalSync/
├── vitalsync_ui-main/       # React + TypeScript frontend
├── sicklecare-ai/
│   └── backend/             # Node.js + Express API
└── vitalsync-ml/            # Python Flask ML service
```

---

## Running Locally

### Prerequisites

- Node.js v18+
- Python 3.10+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/raman-exe404/VitalSync.git
cd VitalSync
```

### 2. Set up environment variables

```bash
# Backend
cp sicklecare-ai/backend/.env.example sicklecare-ai/backend/.env

# Frontend
cp vitalsync_ui-main/.env.example vitalsync_ui-main/.env
```

Fill in your API keys in both `.env` files. You will need:

- Supabase project URL, anon key, and service role key
- Twilio account SID, auth token, and phone number
- OpenRouter API key
- OpenWeatherMap API key
- Google Maps API key (optional — falls back to OpenStreetMap)

### 3. Set up the database

Run `sicklecare-ai/backend/supabase_schema.sql` in your Supabase SQL editor.

### 4. Install dependencies

```bash
# Backend
cd sicklecare-ai/backend && npm install

# Frontend
cd vitalsync_ui-main && npm install

# ML service
cd vitalsync-ml && pip install -r requirements.txt
```

### 5. Train the ML model

```bash
cd vitalsync-ml
python train.py
```

### 6. Start all three services

```bash
# Terminal 1 — Backend API (port 5000)
cd sicklecare-ai/backend
node server.js

# Terminal 2 — ML Service (port 5001)
cd vitalsync-ml
python app.py

# Terminal 3 — Frontend (port 8080)
cd vitalsync_ui-main
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## License

MIT
