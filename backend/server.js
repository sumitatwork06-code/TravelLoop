const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve local uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cities', require('./routes/cities'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/community', require('./routes/community'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Database Connection ──────────────────────────────────────────
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveloop';

  try {
    // Try connecting to the configured MongoDB first
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected (external)');
  } catch (err) {
    console.log('⚠️  Could not connect to MongoDB at:', MONGODB_URI);
    console.log('🔄 Starting MongoDB Memory Server (in-memory, data resets on restart)...\n');

    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();

    await mongoose.connect(memUri);
    console.log('✅ MongoDB Memory Server connected');
    console.log('   ⚡ In-memory mode: data will be lost on server restart');
    console.log('   💡 For persistent data, install MongoDB or set MONGODB_URI in .env\n');

    // Auto-seed demo data in memory mode
    await seedDemoData();
  }
}

// ─── Auto-seed for in-memory mode ─────────────────────────────────
async function seedDemoData() {
  const User = require('./models/User');
  const Trip = require('./models/Trip');
  const crypto = require('crypto');

  // Create demo user
  const demoUser = new User({
    firstName: 'Demo',
    lastName: 'Traveler',
    email: 'demo@traveloop.com',
    password: 'demo123',
    city: 'San Francisco',
    country: 'USA',
    bio: 'Passionate traveler exploring the world ✈️',
    isVerified: true,
    role: 'admin',
  });
  await demoUser.save();

  // Create second user for community feel
  const user2 = new User({
    firstName: 'Alex',
    lastName: 'Explorer',
    email: 'alex@traveloop.com',
    password: 'alex123',
    city: 'London',
    country: 'UK',
    bio: 'Adventure seeker & food lover 🌍',
    isVerified: true,
  });
  await user2.save();

  // Sample trips
  const trips = [
    {
      author: demoUser._id,
      title: 'Summer in Santorini & Athens',
      description: 'A 10-day Greek adventure exploring white-washed villages, ancient ruins, and crystal-clear Aegean waters.',
      coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      startDate: new Date('2026-06-15'), endDate: new Date('2026-06-25'),
      totalBudget: 3500, currency: 'USD', visibility: 'public', travelStyle: 'mid-range', season: 'summer',
      tags: ['beach', 'culture', 'photography'],
      stops: [
        { city: 'Athens', country: 'Greece', state: 'Attica', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-18'),
          activities: [{ name: 'Acropolis Tour', type: 'culture', cost: 20, duration: 180 }, { name: 'Plaka Food Walk', type: 'food', cost: 45, duration: 120 }],
          accommodation: { name: 'Hotel Grande Bretagne', type: 'Hotel', cost: 450 }, transportCost: 80 },
        { city: 'Santorini', country: 'Greece', state: 'South Aegean', startDate: new Date('2026-06-18'), endDate: new Date('2026-06-25'),
          activities: [{ name: 'Sunset at Oia', type: 'sightseeing', cost: 0, duration: 120 }, { name: 'Catamaran Cruise', type: 'adventure', cost: 120, duration: 300 }],
          accommodation: { name: 'Cave Suite in Fira', type: 'Boutique', cost: 1200 }, transportCost: 60 },
      ],
      views: 342, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
    {
      author: demoUser._id,
      title: 'Tokyo & Kyoto Cultural Journey',
      description: 'From neon-lit Shibuya to serene bamboo groves of Arashiyama — the best of Japan.',
      coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      startDate: new Date('2026-04-01'), endDate: new Date('2026-04-12'),
      totalBudget: 4200, currency: 'USD', visibility: 'public', travelStyle: 'mid-range', season: 'spring',
      tags: ['culture', 'food', 'cherry-blossom'],
      stops: [
        { city: 'Tokyo', country: 'Japan', state: 'Kanto', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-06'),
          activities: [{ name: 'Tsukiji Market', type: 'food', cost: 30, duration: 120 }, { name: 'Teamlab Borderless', type: 'culture', cost: 25, duration: 120 }],
          accommodation: { name: 'Shinjuku Hotel', type: 'Hotel', cost: 800 }, transportCost: 150 },
        { city: 'Kyoto', country: 'Japan', state: 'Kansai', startDate: new Date('2026-04-06'), endDate: new Date('2026-04-12'),
          activities: [{ name: 'Fushimi Inari', type: 'culture', cost: 0, duration: 120 }, { name: 'Tea Ceremony', type: 'culture', cost: 40, duration: 60 }],
          accommodation: { name: 'Traditional Ryokan', type: 'Ryokan', cost: 1100 }, transportCost: 130 },
      ],
      views: 518, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
    {
      author: user2._id,
      title: 'Bali Island Paradise',
      description: 'Surf, temples, rice terraces and incredible sunsets — the ultimate Bali escape.',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      startDate: new Date('2026-07-10'), endDate: new Date('2026-07-20'),
      totalBudget: 1800, currency: 'USD', visibility: 'public', travelStyle: 'budget', season: 'summer',
      tags: ['beach', 'surfing', 'budget-friendly'],
      stops: [
        { city: 'Ubud', country: 'Indonesia', state: 'Bali', startDate: new Date('2026-07-10'), endDate: new Date('2026-07-15'),
          activities: [{ name: 'Rice Terrace Walk', type: 'sightseeing', cost: 5, duration: 120 }],
          accommodation: { name: 'Jungle Villa', type: 'Villa', cost: 200 }, transportCost: 20 },
        { city: 'Seminyak', country: 'Indonesia', state: 'Bali', startDate: new Date('2026-07-15'), endDate: new Date('2026-07-20'),
          activities: [{ name: 'Surfing Lesson', type: 'adventure', cost: 35, duration: 180 }],
          accommodation: { name: 'Beach Resort', type: 'Resort', cost: 350 }, transportCost: 15 },
      ],
      views: 287, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
    {
      author: user2._id,
      title: 'Paris Art & Food Tour',
      description: 'World-class museums, patisseries, and Montmartre magic in the City of Lights.',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      startDate: new Date('2026-09-05'), endDate: new Date('2026-09-12'),
      totalBudget: 3000, currency: 'EUR', visibility: 'public', travelStyle: 'luxury', season: 'autumn',
      tags: ['art', 'food', 'romance'],
      stops: [
        { city: 'Paris', country: 'France', state: 'Île-de-France', startDate: new Date('2026-09-05'), endDate: new Date('2026-09-12'),
          activities: [{ name: 'Louvre Museum', type: 'culture', cost: 17, duration: 240 }, { name: 'Eiffel Tower', type: 'sightseeing', cost: 28, duration: 120 }, { name: 'Seine Cruise', type: 'sightseeing', cost: 35, duration: 90 }],
          accommodation: { name: 'Le Marais Hotel', type: 'Boutique', cost: 1400 }, transportCost: 50 },
      ],
      views: 421, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
    {
      author: demoUser._id,
      title: 'Dubai & Abu Dhabi Luxury',
      description: 'Skyscrapers, desert safaris, and Emirates opulence — the future of travel.',
      coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      startDate: new Date('2026-11-01'), endDate: new Date('2026-11-08'),
      totalBudget: 5000, currency: 'USD', visibility: 'public', travelStyle: 'luxury', season: 'autumn',
      tags: ['luxury', 'desert', 'architecture'],
      stops: [
        { city: 'Dubai', country: 'UAE', state: 'Dubai', startDate: new Date('2026-11-01'), endDate: new Date('2026-11-05'),
          activities: [{ name: 'Burj Khalifa', type: 'sightseeing', cost: 40, duration: 90 }, { name: 'Desert Safari', type: 'adventure', cost: 120, duration: 360 }],
          accommodation: { name: 'Atlantis The Palm', type: 'Resort', cost: 2000 }, transportCost: 100 },
        { city: 'Abu Dhabi', country: 'UAE', state: 'Abu Dhabi', startDate: new Date('2026-11-05'), endDate: new Date('2026-11-08'),
          activities: [{ name: 'Sheikh Zayed Mosque', type: 'culture', cost: 0, duration: 120 }],
          accommodation: { name: 'Emirates Palace', type: 'Hotel', cost: 1500 }, transportCost: 50 },
      ],
      views: 195, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
    {
      author: user2._id,
      title: 'New York City Weekend',
      description: 'Broadway, Central Park, and the best pizza on earth — the ultimate NYC experience.',
      coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      startDate: new Date('2026-08-15'), endDate: new Date('2026-08-19'),
      totalBudget: 2500, currency: 'USD', visibility: 'public', travelStyle: 'mid-range', season: 'summer',
      tags: ['city', 'food', 'broadway'],
      stops: [
        { city: 'New York', country: 'USA', state: 'New York', startDate: new Date('2026-08-15'), endDate: new Date('2026-08-19'),
          activities: [{ name: 'Central Park', type: 'sightseeing', cost: 0, duration: 120 }, { name: 'Broadway Show', type: 'culture', cost: 150, duration: 180 }],
          accommodation: { name: 'Midtown Hotel', type: 'Hotel', cost: 800 }, transportCost: 60 },
      ],
      views: 310, shareableLink: crypto.randomBytes(8).toString('hex'),
    },
  ];

  for (const t of trips) {
    await new Trip(t).save();
  }

  console.log('🌱 Auto-seeded: 2 users + 6 trips');
  console.log('   Login: demo@traveloop.com / demo123');
}

// ─── Start Server ─────────────────────────────────────────────────
async function start() {
  await connectDB();

  // Create text index for search
  const Trip = require('./models/Trip');
  try { await Trip.collection.createIndex({ title: 'text', description: 'text' }); } catch {}

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`💡 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start();
