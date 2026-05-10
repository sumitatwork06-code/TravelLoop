const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadTripImage, cloudinary } = require('../cloudinary');
const crypto = require('crypto');
const path = require('path');

// Helper: get file URL (works for both Cloudinary and local)
const getFileUrl = (req, file) => {
  if (!file) return '';
  // Cloudinary gives .path as full URL
  if (file.path && file.path.startsWith('http')) return file.path;
  // Local disk: build URL from filename
  return `${req.protocol}://${req.get('host')}/uploads/trips/${file.filename}`;
};

// GET /api/trips - public trips feed
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, season, style, search, sort = 'recent', isOfficial, excludeOfficial } = req.query;
    const query = { visibility: 'public' };
    if (season && season !== 'any') query.season = season;
    if (style) query.travelStyle = style;
    
    const adminUser = await User.findOne({ email: 'admin@traveloop.com' });
    const adminId = adminUser?._id;

    if (isOfficial === 'true') {
      if (adminId) query.author = adminId;
      else query.tags = 'official'; // Fallback
    } else if (excludeOfficial === 'true') {
      if (adminId) query.author = { $ne: adminId };
      else query.tags = { $ne: 'official' }; // Fallback
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'trending') sortObj = { createdAt: -1, views: -1 };

    const trips = await Trip.find(query)
      .populate('author', 'firstName lastName avatar city country')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Trip.countDocuments(query);
    res.json({ trips, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/my - user's own trips
router.get('/my', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('author', 'firstName lastName avatar city country bio');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.visibility !== 'public' && (!req.user || trip.author._id.toString() !== req.user._id.toString()))
      return res.status(403).json({ message: 'Access denied' });

    trip.views += 1;
    await trip.save();
    res.json({ trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips
router.post('/', auth, uploadTripImage.single('coverImage'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, stops, totalBudget, currency, visibility, tags, travelStyle, season } = req.body;

    const shareableLink = crypto.randomBytes(8).toString('hex');
    const trip = new Trip({
      author: req.user._id,
      title, description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      stops: stops ? JSON.parse(stops) : [],
      totalBudget: Number(totalBudget) || 0,
      currency: currency || 'USD',
      visibility: visibility || 'public',
      tags: tags ? JSON.parse(tags) : [],
      travelStyle, season, shareableLink,
      coverImage: getFileUrl(req, req.file),
      coverImagePublicId: req.file?.filename || ''
    });

    await trip.save();
    const populated = await Trip.findById(trip._id).populate('author', 'firstName lastName avatar');

    if (trip.visibility === 'public') {
      const authorUser = await User.findById(req.user._id);
      if (authorUser && authorUser.followers.length > 0) {
        const notifications = authorUser.followers.map(followerId => ({
          recipient: followerId,
          sender: req.user._id,
          type: 'post',
          trip: trip._id
        }));
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ trip: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/trips/:id
router.put('/:id', auth, uploadTripImage.single('coverImage'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updates = { ...req.body };
    if (updates.stops) updates.stops = JSON.parse(updates.stops);
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (req.file) {
      if (trip.coverImagePublicId && cloudinary) {
        try { await cloudinary.uploader.destroy(trip.coverImagePublicId); } catch {}
      }
      updates.coverImage = getFileUrl(req, req.file);
      updates.coverImagePublicId = req.file.filename;
    }

    Object.assign(trip, updates);
    await trip.save();
    res.json({ trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (trip.coverImagePublicId && cloudinary) {
      try { await cloudinary.uploader.destroy(trip.coverImagePublicId); } catch {}
    }
    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const liked = trip.likes.includes(req.user._id);
    if (liked) trip.likes.pull(req.user._id);
    else trip.likes.push(req.user._id);
    await trip.save();

    res.json({ liked: !liked, likesCount: trip.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/save
router.post('/:id/save', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    const saved = user.savedTrips.includes(trip._id);
    if (saved) user.savedTrips.pull(trip._id);
    else user.savedTrips.push(trip._id);
    await user.save();

    res.json({ saved: !saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/trips/:id/packing
router.put('/:id/packing', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.packingList = req.body.packingList;
    await trip.save();
    res.json({ packingList: trip.packingList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/notes
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.notes.push(req.body);
    await trip.save();
    res.json({ notes: trip.notes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/copy - copy a trip to own account
router.post('/:id/copy', auth, async (req, res) => {
  try {
    const original = await Trip.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Trip not found' });
    const copy = new Trip({
      author: req.user._id,
      title: `${original.title} (Copy)`,
      description: original.description,
      coverImage: original.coverImage,
      startDate: original.startDate,
      endDate: original.endDate,
      stops: original.stops,
      totalBudget: original.totalBudget,
      currency: original.currency,
      visibility: 'private',
      travelStyle: original.travelStyle,
      season: original.season,
      tags: original.tags,
      shareableLink: crypto.randomBytes(8).toString('hex'),
    });
    await copy.save();
    res.status(201).json({ trip: copy, message: 'Trip copied!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips/:id/like - toggle like on a trip
router.post('/:id/like', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isLiked = trip.likes.includes(req.user._id);
    if (isLiked) {
      trip.likes.pull(req.user._id);
    } else {
      trip.likes.push(req.user._id);
      if (trip.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: trip.author,
          sender: req.user._id,
          type: 'like',
          trip: trip._id
        });
        await notification.save();
      }
    }
    await trip.save();
    res.json({ liked: !isLiked, likesCount: trip.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id - delete a trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    // Check ownership
    if (trip.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this trip' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
