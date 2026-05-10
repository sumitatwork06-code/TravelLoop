const express = require('express');
const router = express.Router();

const activitiesData = [
  { name: 'Eiffel Tower Visit', city: 'Paris', type: 'sightseeing', cost: 28, duration: 120, rating: 4.8 },
  { name: 'Louvre Museum', city: 'Paris', type: 'culture', cost: 17, duration: 180, rating: 4.7 },
  { name: 'Tsukiji Market Tour', city: 'Tokyo', type: 'food', cost: 30, duration: 120, rating: 4.9 },
  { name: 'Bali Surfing Lesson', city: 'Bali', type: 'adventure', cost: 35, duration: 180, rating: 4.6 },
  { name: 'Colosseum Tour', city: 'Rome', type: 'culture', cost: 16, duration: 120, rating: 4.8 },
  { name: 'Sagrada Familia', city: 'Barcelona', type: 'culture', cost: 26, duration: 90, rating: 4.9 },
  { name: 'Burj Khalifa Tour', city: 'Dubai', type: 'sightseeing', cost: 40, duration: 90, rating: 4.7 },
];

router.get('/', (req, res) => {
  const { city, type, maxCost } = req.query;
  let activities = [...activitiesData];
  if (city) activities = activities.filter(a => a.city.toLowerCase() === city.toLowerCase());
  if (type) activities = activities.filter(a => a.type === type);
  if (maxCost) activities = activities.filter(a => a.cost <= Number(maxCost));
  res.json({ activities });
});

module.exports = router;
