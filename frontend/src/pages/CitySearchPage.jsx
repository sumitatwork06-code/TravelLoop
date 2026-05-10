import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Star, Plus, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CitySearchPage() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // Only fetch official seeded trips for Explore Cities
        const { data } = await axios.get('/trips', { 
          params: { search, limit: 20, isOfficial: true } 
        });
        setTrips(data.trips || []);
      } catch (err) {
        console.error('Error fetching city plans:', err);
      }
      finally { setLoading(false); }
    };
    const timer = setTimeout(fetch, 300);
    return () => clearTimeout(timer);
  }, [search]);


  return (
    <div className="page">
      <h1 className="page-title">Explore Countries & Cities</h1>
      <p className="page-subtitle">Discover amazing destinations around the world</p>

      {/* Toolbar - Matching Screen 8 Wireframe */}
      <div className="toolbar animate-fade">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search countries or cities..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Group by</button>
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-outline btn-sm">Sort by...</button>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>Explore Trip Plans</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{trips.length} expert-planned itineraries for your next journey</p>
      </div>
 
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 20 }} />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗺️</div>
          <h3>No plans found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different country or city</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {trips.map((trip, i) => {
            const country = trip.stops?.[0]?.country || '';
            const currencyMap = {
              'France': { code: 'EUR', rate: 1/90, symbol: '€' },
              'Japan': { code: 'JPY', rate: 1/0.55, symbol: '¥' },
              'Italy': { code: 'EUR', rate: 1/90, symbol: '€' },
              'Thailand': { code: 'THB', rate: 1/2.3, symbol: '฿' },
              'UK': { code: 'GBP', rate: 1/105, symbol: '£' },
              'USA': { code: 'USD', rate: 1/83, symbol: '$' },
              'Australia': { code: 'AUD', rate: 1/55, symbol: 'A$' },
              'India': { code: 'INR', rate: 1, symbol: '₹' }
            };
            const local = currencyMap[country] || { code: 'USD', rate: 1/83, symbol: '$' };
            const localPrice = (trip.totalBudget * local.rate).toLocaleString(undefined, { maximumFractionDigits: 0 });

            return (
              <div key={trip._id} className="card-static animate-fade" style={{ 
                padding: 0, 
                borderRadius: 24, 
                overflow: 'hidden', 
                display: 'flex', 
                animationDelay: `${i * 0.05}s`,
                background: 'white',
                border: '1px solid var(--border)',
                minHeight: '180px'
              }}>
                <div style={{ width: 280, height: 'auto', flexShrink: 0, position: 'relative' }}>
                  <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, fontSize: '1.2rem', background: 'white', padding: '8px 12px', borderRadius: 12, fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    {trip.stops?.[0]?.city}
                  </div>
                </div>
                <div style={{ flex: 1, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>{trip.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {trip.description}
                    </p>
                    <div style={{ display: 'flex', gap: 20, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="var(--gold-dark)" /> {country} ({trip.stops?.length} Stops)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} color="var(--gold)" fill="var(--gold)" /> {trip.views} Views</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--teal)' }}>₹{trip.totalBudget.toLocaleString()}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>≈ {local.symbol}{localPrice} {local.code}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button onClick={() => navigate(`/trips/${trip._id}`)} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700 }}>
                      View Plan
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await axios.post(`/trips/${trip._id}/copy`);
                          navigate('/my-trips');
                        } catch (err) {
                          alert('Please login to save this trip!');
                        }
                      }}
                      className="btn btn-outline" 
                      style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 600 }}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

