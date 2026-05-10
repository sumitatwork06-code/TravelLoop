const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');
const crypto = require('crypto');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveloop';

// Currency conversion rate roughly (1 USD = 83 INR)
const TO_INR = 83;

const COUNTRIES = [
  { 
    name: 'France', emoji: '🇫🇷', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 
    currency: 'EUR', rate: 90, // 1 EUR = 90 INR approx
    stops: [
      { city: 'Paris', desc: 'The city of lights and iconic landmarks.' },
      { city: 'Bordeaux', desc: 'World-renowned wine region with historic architecture.' },
      { city: 'Provence', desc: 'Lavender fields and charming hillside villages.' },
      { city: 'Mont Saint-Michel', desc: 'A magical island commune in Normandy.' },
      { city: 'Nice', desc: 'The glamorous heart of the French Riviera.' }
    ]
  },
  { 
    name: 'Japan', emoji: '🇯🇵', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 
    currency: 'JPY', rate: 0.55, // 1 JPY = 0.55 INR approx
    stops: [
      { city: 'Tokyo', desc: 'Neon lights and bustling metropolitan energy.' },
      { city: 'Kyoto', desc: 'Traditional temples and serene zen gardens.' },
      { city: 'Osaka', desc: 'Japan\'s kitchen, famous for street food.' },
      { city: 'Hakone', desc: 'Hot springs with majestic views of Mt. Fuji.' },
      { city: 'Hiroshima', desc: 'A city of peace and historical significance.' }
    ]
  },
  { 
    name: 'Italy', emoji: '🇮🇹', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 
    currency: 'EUR', rate: 90,
    stops: [
      { city: 'Rome', desc: 'Eternal city filled with ancient history.' },
      { city: 'Florence', desc: 'The cradle of the Renaissance.' },
      { city: 'Venice', desc: 'Romantic city of canals and bridges.' },
      { city: 'Amalfi Coast', desc: 'Breathtaking coastal cliffs and colorful towns.' },
      { city: 'Milan', desc: 'The global capital of fashion and design.' }
    ]
  },
  { 
    name: 'India', emoji: '🇮🇳', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', 
    currency: 'INR', rate: 1,
    stops: [
      { city: 'New Delhi', desc: 'Bustling capital with deep historical roots.' },
      { city: 'Agra', desc: 'Home to the magnificent Taj Mahal.' },
      { city: 'Jaipur', desc: 'The Pink City of royal palaces.' },
      { city: 'Udaipur', desc: 'The City of Lakes and romantic settings.' },
      { city: 'Kerala', desc: 'God\'s own country with tranquil backwaters.' }
    ]
  },
  { 
    name: 'Thailand', emoji: '🇹🇭', img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800', 
    currency: 'THB', rate: 2.3, // 1 THB = 2.3 INR
    stops: [
      { city: 'Bangkok', desc: 'Vibrant street life and golden temples.' },
      { city: 'Chiang Mai', desc: 'Lush mountains and spiritual culture.' },
      { city: 'Phuket', desc: 'Crystal clear waters and beach resorts.' },
      { city: 'Ayutthaya', desc: 'Ancient ruins of a former capital.' },
      { city: 'Krabi', desc: 'Stunning limestone cliffs and island hopping.' }
    ]
  },
  { 
    name: 'UK', emoji: '🎡', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 
    currency: 'GBP', rate: 105, // 1 GBP = 105 INR
    stops: [
      { city: 'London', desc: 'Historic capital with world-class museums.' },
      { city: 'Edinburgh', desc: 'Medieval old town and stunning castle.' },
      { city: 'Bath', desc: 'Famous for its ancient Roman-built baths.' },
      { city: 'Oxford', desc: 'The city of dreaming spires and elite education.' },
      { city: 'Scottish Highlands', desc: 'Rugged landscapes and mythical lochs.' }
    ]
  },
  { 
    name: 'USA', emoji: '🗽', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 
    currency: 'USD', rate: 83,
    stops: [
      { city: 'New York', desc: 'The city that never sleeps.' },
      { city: 'Los Angeles', desc: 'Hollywood glamour and beautiful beaches.' },
      { city: 'Grand Canyon', desc: 'One of the world\'s seven natural wonders.' },
      { city: 'Las Vegas', desc: 'The entertainment capital of the world.' },
      { city: 'San Francisco', desc: 'Golden Gate Bridge and historic cable cars.' }
    ]
  },
  { 
    name: 'Australia', emoji: '🐨', img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800', 
    currency: 'AUD', rate: 55, // 1 AUD = 55 INR
    stops: [
      { city: 'Sydney', desc: 'Iconic Opera House and vibrant harbor.' },
      { city: 'Melbourne', desc: 'Laneways, coffee culture, and art.' },
      { city: 'Great Barrier Reef', desc: 'The world\'s largest coral reef system.' },
      { city: 'Uluru', desc: 'Spiritual heart of the Red Centre.' },
      { city: 'Gold Coast', desc: 'Surfing paradise with thrilling theme parks.' }
    ]
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Clear previous seeded country plans
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = new User({
      firstName: 'Traveloop', lastName: 'Official', email: 'admin@traveloop.com',
      password: 'adminpassword123', role: 'admin', isVerified: true
    });
    await admin.save();
  }
  
  // Remove existing official plans to avoid duplicates
  await Trip.deleteMany({ author: admin._id, tags: 'official' });

  const trips = COUNTRIES.map(c => {
    // Base daily cost in INR for a mid-range traveler
    const dailyCostINR = 12000; 
    const days = 10;
    const totalINR = dailyCostINR * days;
    const localCurrencyTotal = (totalINR / c.rate).toFixed(0);

    return {
      author: admin._id,
      title: `${c.name} - Ultimate 10-Day Explorer`,
      description: `A comprehensive 10-day journey through the heart of ${c.name}. Experience 5 distinct regions, each offering unique culture, history, and landscapes.`,
      coverImage: c.img,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-11'),
      totalBudget: totalINR, // All stored in INR now
      currency: 'INR',
      visibility: 'public',
      travelStyle: 'mid-range',
      tags: ['official', c.name.toLowerCase()],
      stops: c.stops.map((stop, idx) => ({
        city: stop.city,
        country: c.name,
        startDate: new Date(2026, 5, 1 + (idx * 2)),
        endDate: new Date(2026, 5, 3 + (idx * 2)),
        notes: stop.desc,
        activities: [
          { name: 'City Highlight Tour', type: 'sightseeing', cost: (dailyCostINR * 0.2), duration: 180 },
          { name: 'Local Experience', type: 'culture', cost: (dailyCostINR * 0.1), duration: 120 }
        ],
        accommodation: { name: 'Premium Central Stay', type: 'Hotel', cost: (dailyCostINR * 0.4) },
        foodCost: (dailyCostINR * 0.2),
        transportCost: (dailyCostINR * 0.1)
      })),
      views: Math.floor(Math.random() * 2000) + 1000,
      shareableLink: crypto.randomBytes(8).toString('hex'),
      notes: [{ content: `Estimated total in ${c.currency}: ${c.currency} ${localCurrencyTotal}`, day: 1 }]
    };
  });

  await Trip.insertMany(trips);
  console.log(`Successfully updated ${trips.length} country trip plans with 5 stops and INR currency!`);
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
