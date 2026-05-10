const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  activities: [{
    name: String,
    description: String,
    type: { type: String, enum: ['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife', 'other'] },
    cost: { type: Number, default: 0 },
    duration: { type: Number, default: 60 }, // minutes
    image: String,
    completed: { type: Boolean, default: false }
  }],
  accommodation: {
    name: { type: String },
    type: { type: String },
    cost: { type: Number },
    address: { type: String }
  },
  transportCost: { type: Number, default: 0 },
  foodCost: { type: Number, default: 0 },
  notes: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const tripSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  stops: [stopSchema],
  totalBudget: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['planning', 'ongoing', 'completed', 'cancelled'], default: 'planning' },
  visibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  shareableLink: { type: String, unique: true, sparse: true },
  packingList: [{
    category: { type: String, default: 'General' },
    items: [{
      name: String,
      packed: { type: Boolean, default: false }
    }]
  }],
  notes: [{
    content: String,
    stop: String,
    day: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  travelStyle: { type: String, enum: ['budget', 'mid-range', 'luxury', 'backpacker', 'family'], default: 'mid-range' },
  season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter', 'any'], default: 'any' }
}, { timestamps: true });

tripSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

tripSchema.virtual('estimatedCost').get(function() {
  return this.stops.reduce((total, stop) => {
    const activityCost = stop.activities.reduce((a, act) => a + (act.cost || 0), 0);
    const accomCost = stop.accommodation?.cost || 0;
    return total + activityCost + accomCost + (stop.transportCost || 0) + (stop.foodCost || 0);
  }, 0);
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
