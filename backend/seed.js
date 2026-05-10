/**
 * Seed Script for Traveloop
 * Run: node seed.js
 * Creates a demo user and sample trips so the app has data to display.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveloop';

const sampleTrips = [
  {
    title: 'Summer in Santorini & Athens',
    description: 'A 10-day Greek adventure exploring the iconic white-washed villages of Santorini, ancient ruins of Athens, and crystal-clear Aegean waters.',
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-06-25'),
    totalBudget: 3500,
    currency: 'USD',
    visibility: 'public',
    travelStyle: 'mid-range',
    season: 'summer',
    tags: ['beach', 'culture', 'photography', 'europe'],
    stops: [
      {
        city: 'Athens', country: 'Greece', state: 'Attica',
        startDate: new Date('2026-06-15'), endDate: new Date('2026-06-18'),
        activities: [
          { name: 'Acropolis Tour', type: 'culture', cost: 20, duration: 180 },
          { name: 'Plaka Food Walk', type: 'food', cost: 45, duration: 120 },
        ],
        accommodation: { name: 'Hotel Grande Bretagne', type: 'Hotel', cost: 450 },
        transportCost: 80
      },
      {
        city: 'Santorini', country: 'Greece', state: 'South Aegean',
        startDate: new Date('2026-06-18'), endDate: new Date('2026-06-25'),
        activities: [
          { name: 'Sunset at Oia', type: 'sightseeing', cost: 0, duration: 120 },
          { name: 'Wine Tasting Tour', type: 'food', cost: 65, duration: 180 },
          { name: 'Catamaran Cruise', type: 'adventure', cost: 120, duration: 300 },
        ],
        accommodation: { name: 'Cave Suite in Fira', type: 'Boutique', cost: 1200 },
        transportCost: 60
      }
    ]
  },
  {
    title: 'Tokyo & Kyoto Cultural Journey',
    description: 'Immerse yourself in Japanese culture, from the neon-lit streets of Shibuya to the serene bamboo groves of Arashiyama.',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-12'),
    totalBudget: 4200,
    currency: 'USD',
    visibility: 'public',
    travelStyle: 'mid-range',
    season: 'spring',
    tags: ['culture', 'food', 'temples', 'cherry-blossom'],
    stops: [
      {
        city: 'Tokyo', country: 'Japan', state: 'Kanto',
        startDate: new Date('2026-04-01'), endDate: new Date('2026-04-06'),
        activities: [
          { name: 'Tsukiji Market Tour', type: 'food', cost: 30, duration: 120 },
          { name: 'Shibuya & Harajuku Walk', type: 'sightseeing', cost: 0, duration: 180 },
          { name: 'Teamlab Borderless', type: 'culture', cost: 25, duration: 120 },
        ],
        accommodation: { name: 'Shinjuku Hotel', type: 'Hotel', cost: 800 },
        transportCost: 150
      },
      {
        city: 'Kyoto', country: 'Japan', state: 'Kansai',
        startDate: new Date('2026-04-06'), endDate: new Date('2026-04-12'),
        activities: [
          { name: 'Fushimi Inari Shrine', type: 'culture', cost: 0, duration: 120 },
          { name: 'Bamboo Grove Walk', type: 'sightseeing', cost: 0, duration: 90 },
          { name: 'Tea Ceremony', type: 'culture', cost: 40, duration: 60 },
        ],
        accommodation: { name: 'Traditional Ryokan', type: 'Ryokan', cost: 1100 },
        transportCost: 130
      }
    ]
  },
  {
    title: 'Bali Island Paradise',
    description: 'Surf, temples, rice terraces and incredible sunsets. The ultimate Bali escape.',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    startDate: new Date('2026-07-10'),
    endDate: new Date('2026-07-20'),
    totalBudget: 1800,
    currency: 'USD',
    visibility: 'public',
    travelStyle: 'budget',
    season: 'summer',
    tags: ['beach', 'surfing', 'temples', 'budget-friendly'],
    stops: [
      {
        city: 'Ubud', country: 'Indonesia', state: 'Bali',
        startDate: new Date('2026-07-10'), endDate: new Date('2026-07-15'),
        activities: [
          { name: 'Tegallalang Rice Terrace', type: 'sightseeing', cost: 5, duration: 120 },
          { name: 'Monkey Forest', type: 'sightseeing', cost: 8, duration: 90 },
        ],
        accommodation: { name: 'Jungle Villa', type: 'Villa', cost: 200 },
        transportCost: 20
      },
      {
        city: 'Seminyak', country: 'Indonesia', state: 'Bali',
        startDate: new Date('2026-07-15'), endDate: new Date('2026-07-20'),
        activities: [
          { name: 'Surfing Lesson', type: 'adventure', cost: 35, duration: 180 },
          { name: 'Beach Club Sunset', type: 'nightlife', cost: 25, duration: 180 },
        ],
        accommodation: { name: 'Beach Resort', type: 'Resort', cost: 350 },
        transportCost: 15
      }
    ]
  },
  {
    title: 'Paris Art & Food Tour',
    description: 'A romantic week in the City of Lights — world-class museums, patisseries, and the magic of Montmartre.',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    startDate: new Date('2026-09-05'),
    endDate: new Date('2026-09-12'),
    totalBudget: 3000,
    currency: 'EUR',
    visibility: 'public',
    travelStyle: 'luxury',
    season: 'autumn',
    tags: ['art', 'food', 'romance', 'museums'],
    stops: [
      {
        city: 'Paris', country: 'France', state: 'Île-de-France',
        startDate: new Date('2026-09-05'), endDate: new Date('2026-09-12'),
        activities: [
          { name: 'Louvre Museum', type: 'culture', cost: 17, duration: 240 },
          { name: 'Eiffel Tower', type: 'sightseeing', cost: 28, duration: 120 },
          { name: 'Montmartre Food Tour', type: 'food', cost: 85, duration: 180 },
          { name: 'Seine River Cruise', type: 'sightseeing', cost: 35, duration: 90 },
        ],
        accommodation: { name: 'Le Marais Boutique Hotel', type: 'Boutique', cost: 1400 },
        transportCost: 50
      }
    ]
  },
  {
    title: 'Dubai & Abu Dhabi Luxury',
    description: 'Experience the future of travel — skyscrapers, desert safaris, and the opulence of the Emirates.',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-08'),
    totalBudget: 5000,
    currency: 'USD',
    visibility: 'public',
    travelStyle: 'luxury',
    season: 'autumn',
    tags: ['luxury', 'architecture', 'desert', 'shopping'],
    stops: [
      {
        city: 'Dubai', country: 'UAE', state: 'Dubai',
        startDate: new Date('2026-11-01'), endDate: new Date('2026-11-05'),
        activities: [
          { name: 'Burj Khalifa Visit', type: 'sightseeing', cost: 40, duration: 90 },
          { name: 'Desert Safari', type: 'adventure', cost: 120, duration: 360 },
          { name: 'Dubai Mall Shopping', type: 'shopping', cost: 0, duration: 240 },
        ],
        accommodation: { name: 'Atlantis The Palm', type: 'Resort', cost: 2000 },
        transportCost: 100
      },
      {
        city: 'Abu Dhabi', country: 'UAE', state: 'Abu Dhabi',
        startDate: new Date('2026-11-05'), endDate: new Date('2026-11-08'),
        activities: [
          { name: 'Sheikh Zayed Mosque', type: 'culture', cost: 0, duration: 120 },
          { name: 'Louvre Abu Dhabi', type: 'culture', cost: 20, duration: 180 },
        ],
        accommodation: { name: 'Emirates Palace', type: 'Hotel', cost: 1500 },
        transportCost: 50
      }
    ]
  },
  {
    title: 'New York City Weekend',
    description: 'The ultimate NYC experience — Broadway, Central Park, and the best pizza on earth.',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    startDate: new Date('2026-08-15'),
    endDate: new Date('2026-08-19'),
    totalBudget: 2500,
    currency: 'USD',
    visibility: 'public',
    travelStyle: 'mid-range',
    season: 'summer',
    tags: ['city', 'food', 'broadway', 'nightlife'],
    stops: [
      {
        city: 'New York', country: 'USA', state: 'New York',
        startDate: new Date('2026-08-15'), endDate: new Date('2026-08-19'),
        activities: [
          { name: 'Central Park Walk', type: 'sightseeing', cost: 0, duration: 120 },
          { name: 'Broadway Show', type: 'culture', cost: 150, duration: 180 },
          { name: 'Statue of Liberty', type: 'sightseeing', cost: 24, duration: 240 },
        ],
        accommodation: { name: 'Midtown Hotel', type: 'Hotel', cost: 800 },
        transportCost: 60
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user exists
    let demoUser = await User.findOne({ email: 'demo@traveloop.com' });

    if (!demoUser) {
      demoUser = new User({
        firstName: 'Demo',
        lastName: 'Traveler',
        email: 'demo@traveloop.com',
        password: 'demo123',
        city: 'San Francisco',
        country: 'USA',
        bio: 'Passionate traveler exploring the world one city at a time ✈️',
        isVerified: true,
        role: 'admin', // Give demo user admin access to see admin panel
      });
      await demoUser.save();
      console.log('👤 Demo user created: demo@traveloop.com / demo123');
    } else {
      console.log('👤 Demo user already exists');
    }

    // Create sample trips (only if none exist for this user)
    const existingTrips = await Trip.countDocuments({ author: demoUser._id });
    if (existingTrips === 0) {
      for (const tripData of sampleTrips) {
        const trip = new Trip({
          ...tripData,
          author: demoUser._id,
          shareableLink: crypto.randomBytes(8).toString('hex'),
          views: Math.floor(Math.random() * 500) + 50,
          likes: [],
        });
        await trip.save();
        console.log(`  ✅ Created trip: ${tripData.title}`);
      }
      console.log(`\n🎉 Seeded ${sampleTrips.length} sample trips!`);
    } else {
      console.log(`📦 ${existingTrips} trips already exist for demo user, skipping...`);
    }

    console.log('\n🚀 Seed complete! You can now login with:');
    console.log('   Email:    demo@traveloop.com');
    console.log('   Password: demo123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
