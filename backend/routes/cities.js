const express = require('express');
const router = express.Router();

// Popular cities data
const citiesData = [
  { name: 'Paris', country: 'France', state: 'Île-de-France', costIndex: 'high', popularity: 98, emoji: '🗼', description: 'City of Love and Lights', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { name: 'Tokyo', country: 'Japan', state: 'Kanto', costIndex: 'high', popularity: 96, emoji: '⛩️', description: 'Where tradition meets future', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { name: 'Bali', country: 'Indonesia', state: 'Bali', costIndex: 'low', popularity: 94, emoji: '🌴', description: 'Island of the Gods', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { name: 'New York', country: 'USA', state: 'New York', costIndex: 'very-high', popularity: 97, emoji: '🗽', description: 'The city that never sleeps', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { name: 'Rome', country: 'Italy', state: 'Lazio', costIndex: 'medium', popularity: 93, emoji: '🏛️', description: 'Eternal City of History', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { name: 'Barcelona', country: 'Spain', state: 'Catalonia', costIndex: 'medium', popularity: 91, emoji: '🎭', description: 'Gaudí\'s architectural marvel', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
  { name: 'Dubai', country: 'UAE', state: 'Dubai', costIndex: 'high', popularity: 90, emoji: '🏙️', description: 'Futuristic desert metropolis', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { name: 'Bangkok', country: 'Thailand', state: 'Bangkok', costIndex: 'low', popularity: 89, emoji: '🙏', description: 'Temple city of Southeast Asia', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400' },
  { name: 'London', country: 'UK', state: 'England', costIndex: 'very-high', popularity: 95, emoji: '🎡', description: 'Royal capital of the world', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { name: 'Santorini', country: 'Greece', state: 'South Aegean', costIndex: 'high', popularity: 92, emoji: '🌅', description: 'Iconic white-washed paradise', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400' },
  { name: 'Singapore', country: 'Singapore', state: '', costIndex: 'high', popularity: 88, emoji: '🦁', description: 'Lion City of Asia', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { name: 'Amsterdam', country: 'Netherlands', state: 'North Holland', costIndex: 'high', popularity: 87, emoji: '🚲', description: 'City of canals and tulips', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: 'Kyoto', country: 'Japan', state: 'Kansai', costIndex: 'medium', popularity: 86, emoji: '🍁', description: 'Ancient capital of Japan', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400' },
  { name: 'Istanbul', country: 'Turkey', state: 'Istanbul', costIndex: 'medium', popularity: 85, emoji: '🕌', description: 'Where East meets West', image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400' },
  { name: 'Maldives', country: 'Maldives', state: '', costIndex: 'very-high', popularity: 91, emoji: '🏖️', description: 'Tropical paradise on earth', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400' },
];

// Countries with states
const countriesData = {
  'India': ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'],
  'USA': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
  'UK': ['England','Scotland','Wales','Northern Ireland'],
  'Australia': ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','ACT','Northern Territory'],
  'Canada': ['Ontario','Quebec','British Columbia','Alberta','Manitoba','Saskatchewan','Nova Scotia','New Brunswick','Newfoundland','Prince Edward Island'],
  'Germany': ['Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Lower Saxony','Mecklenburg-Vorpommern','North Rhine-Westphalia','Rhineland-Palatinate','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'],
  'France': ['Île-de-France','Normandy','Brittany','Pays de la Loire','Centre-Val de Loire','Burgundy','Alsace','Lorraine','Champagne','Picardy','Provence','Languedoc','Midi-Pyrénées','Aquitaine','Rhône-Alpes','Auvergne'],
  'Japan': ['Hokkaido','Tohoku','Kanto','Chubu','Kansai','Chugoku','Shikoku','Kyushu'],
  'Italy': ['Lazio','Lombardy','Sicily','Sardinia','Veneto','Campania','Tuscany','Emilia-Romagna','Piedmont','Apulia'],
  'Spain': ['Catalonia','Andalusia','Madrid','Valencia','Galicia','Castile and León','Basque Country','Aragon','Canary Islands','Balearic Islands'],
};

// GET /api/cities - search/list cities
router.get('/', (req, res) => {
  const { search, country, region, limit = 20 } = req.query;
  let cities = [...citiesData];

  if (search) cities = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));
  if (country) cities = cities.filter(c => c.country === country);
  if (region) cities = cities.filter(c => c.state === region);

  cities.sort((a, b) => b.popularity - a.popularity);
  res.json({ cities: cities.slice(0, Number(limit)) });
});

// GET /api/cities/countries
router.get('/countries', (req, res) => {
  res.json({ countries: Object.keys(countriesData).sort() });
});

// GET /api/cities/states/:country
router.get('/states/:country', (req, res) => {
  const states = countriesData[req.params.country] || [];
  res.json({ states });
});

module.exports = router;
