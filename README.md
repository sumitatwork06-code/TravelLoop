# 🌍 TravelLoop

TravelLoop is a full-stack travel planning application designed to streamline journey organization, destination discovery, and itinerary sharing.

---

## 🚀 Features

- **Interactive Frontend:** Responsive UI built with React, Vite, and Tailwind/CSS.
- **Trip & Itinerary Management:** Create, customize, and view detailed trip plans with interactive stops and activities.
- **Budgeting & Packing Checklists:** Track trip expenses and manage packing items.
- **Community & Public Trips:** Share trip itineraries publicly with the community.
- **Auto-Seeding & In-Memory MongoDB:** Built-in automatic fallback to `mongodb-memory-server` if local MongoDB is not running (zero-config setup for development).

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router v7, Axios, Lucide Icons, React Hot Toast
- **Backend:** Node.js, Express.js, Mongoose, JWT, Cloudinary / Local Uploads
- **Database:** MongoDB (with automatic MongoMemoryServer fallback for local dev)

---

## 💻 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/sumitatwork06-code/TravelLoop.git
cd TravelLoop
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
> Server runs at `http://localhost:5000` (API Health Check: `http://localhost:5000/api/health`).  
> *Default Demo Login:* `demo@traveloop.com` / `demo123`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
> App runs at `http://localhost:5173`.

---

## ☁️ Deployment Guide

### Option 1: Deploy on Render (Recommended Blueprint)
This repository includes a `render.yaml` blueprint for zero-config full-stack deployment on Render:

1. Push code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml` and provision both:
   - **Backend Web Service** (Node.js API)
   - **Frontend Static Site** (React build)
4. Set environment variables when prompted (`MONGODB_URI`, `CLIENT_URL`, `VITE_API_URL`).

### Option 2: Deploy Frontend on Vercel / Netlify
1. Connect your `frontend` directory to Vercel/Netlify.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`

### Option 3: Deploy via Docker / Cloud Run / Railway
Use the included multi-stage `Dockerfile`:
```bash
docker build -t travelloop .
docker run -p 5000:5000 -e MONGODB_URI="your_mongodb_uri" travelloop
```

---

## 📂 Project Structure

```text
TravelLoop/
├── backend/                # Server-side API & MongoDB models
│   ├── models/             # Mongoose schemas (User, Trip, Notification)
│   ├── routes/             # Express API endpoints
│   ├── middleware/         # JWT Auth & Security
│   ├── server.js           # Server entry point
│   └── .env.example        # Environment variables template
├── frontend/               # Client-side React SPA
│   ├── src/
│   │   ├── components/     # Layout & UI components
│   │   ├── context/        # Auth state provider
│   │   └── pages/          # App views & dashboards
│   ├── vercel.json         # SPA router fallback configuration
│   └── .env.example        # Frontend environment variables
├── render.yaml             # Render 1-click deployment blueprint
└── Dockerfile              # Multi-stage production container setup
```

---

## 🛡️ License

Distributed under the MIT License.
