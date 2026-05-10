const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { uploadAvatar, cloudinary } = require('../cloudinary');

// Helper: get file URL
const getFileUrl = (req, file) => {
  if (!file) return '';
  if (file.path && file.path.startsWith('http')) return file.path;
  return `${req.protocol}://${req.get('host')}/uploads/avatars/${file.filename}`;
};

// GET /api/users/profile/:id
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const trips = await Trip.find({ author: user._id, visibility: 'public' }).sort({ createdAt: -1 });
    res.json({ user, trips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const { firstName, lastName, bio, city, country, phone, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (req.file) {
      if (user.avatarPublicId && cloudinary) {
        try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch {}
      }
      user.avatar = getFileUrl(req, req.file);
      user.avatarPublicId = req.file.filename;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (phone !== undefined) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...JSON.parse(preferences) };

    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/saved-trips
router.get('/saved-trips', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedTrips',
      populate: { path: 'author', select: 'firstName lastName avatar' }
    });
    res.json({ trips: user.savedTrips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/stats (admin)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const publicTrips = await Trip.countDocuments({ visibility: 'public' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10)
      .select('firstName lastName email createdAt');
    res.json({ totalUsers, totalTrips, publicTrips, recentUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DELETE /api/users/account
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete all trips authored by the user
    await Trip.deleteMany({ author: req.user._id });
    // Delete the user account
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account and associated trips deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName avatar')
      .populate('trip', 'title')
      .limit(20);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/notifications/read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(targetUser._id);
    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      
      const notification = new Notification({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow'
      });
      await notification.save();
    }
    await currentUser.save();
    await targetUser.save();
    
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
