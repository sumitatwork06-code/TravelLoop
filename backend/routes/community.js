const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// GET /api/community - same as public trips but with additional community features
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'trending' } = req.query;
    let sortObj = { createdAt: -1, views: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'recent') sortObj = { createdAt: -1 };

    const trips = await Trip.find({ visibility: 'public' })
      .populate('author', 'firstName lastName avatar city country')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Trip.countDocuments({ visibility: 'public' });
    res.json({ trips, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
