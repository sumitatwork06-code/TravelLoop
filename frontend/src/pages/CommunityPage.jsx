import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/common/TripCard';

const COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/trips', {
        params: { search, season: season !== 'all' ? season : undefined, page, limit: 12, excludeOfficial: true }
      });
      setTrips(data.trips || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [season, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTrips();
  };

  const handleLike = async (tripId) => {
    try {
      const { data } = await axios.post(`/trips/${tripId}/like`);
      setTrips(trips.map(t => t._id === tripId ? { ...t, likes: data.likes } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900 }}>Community Journeys</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Discover adventures from travelers around the world</p>
      </div>

      {/* Toolbar */}
      <div className="filters-bar card-static" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px', 
        borderRadius: '20px', 
        marginBottom: 40,
        gap: 20,
        background: 'white'
      }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search trips, destinations, or authors..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ paddingLeft: 48, borderRadius: '12px', height: '48px', border: '1px solid var(--border)', width: '100%' }}
          />
        </form>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <FilterIcon size={18} color="var(--text-muted)" />
          <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', padding: '6px', borderRadius: '14px' }}>
            {['all', 'Summer', 'Winter', 'Spring', 'Autumn'].map(s => (
              <button 
                key={s} 
                onClick={() => setSeason(s)} 
                className={`btn btn-sm ${season === s ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: '10px', 
                  background: season === s ? 'var(--primary)' : 'transparent',
                  color: season === s ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  fontWeight: 700
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, fontWeight: 600 }}>Showing {trips.length} of {total} shared trips</p>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 350, borderRadius: '24px' }} />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state" style={{ padding: '100px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🌎</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>No journeys found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try searching for something else or changing your filters.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: 32 }}>
          {trips.map((trip, i) => (
            <TripCard 
              key={trip._id} 
              trip={trip} 
              index={i} 
              onLike={handleLike} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-outline btn-sm">Previous</button>
          <span style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>Page {page}</span>
          <button onClick={() => setPage(page + 1)} disabled={trips.length < 12} className="btn btn-outline btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
