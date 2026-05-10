import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Grid3X3, List } from 'lucide-react';
import TripCard from '../components/common/TripCard';

export default function MyTripsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  useEffect(() => {
    const fetch = async () => {
      try { 
        const { data } = await axios.get('/trips/my'); 
        setTrips(data.trips || []); 
      }
      catch (err) { toast.error('Failed to load trips'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = trips.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    const isPast = new Date(t.endDate) < new Date();
    const isFuture = new Date(t.startDate) > new Date();
    if (filter === 'planning') return isFuture;
    if (filter === 'ongoing') return !isFuture && !isPast;
    if (filter === 'completed') return isPast;
    return true;
  });

  const handleDelete = async (tripId) => {
    try {
      await axios.delete(`/trips/${tripId}`);
      setTrips(trips.filter(t => t._id !== tripId));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <div className="page" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900 }}>My Journeys</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{trips.length} adventures tracked</p>
        </div>
        <button onClick={() => navigate('/trips/create')} className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: 800 }}>
          <Plus size={20} /> Create New Trip
        </button>
      </div>

      {/* Filters Bar */}
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
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search your trips..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ paddingLeft: 48, borderRadius: '12px', height: '48px', border: '1px solid var(--border)', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', padding: '6px', borderRadius: '14px' }}>
          {['all','planning','ongoing','completed'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`} 
              style={{ 
                textTransform: 'capitalize', 
                borderRadius: '10px', 
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 16px',
                fontWeight: 700
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setView('grid')} className={`btn btn-icon ${view==='grid' ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: '10px' }}><Grid3X3 size={18} /></button>
          <button onClick={() => setView('list')} className={`btn btn-icon ${view==='list' ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: '10px' }}><List size={18} /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛸</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>No trips found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{search ? "We couldn't find any trips matching your search." : "You haven't started any adventures yet!"}</p>
          {!search && <button onClick={() => navigate('/trips/create')} className="btn btn-primary" style={{ padding: '14px 32px' }}>Start Your First Journey</button>}
        </div>
      ) : (
        <div className={view === 'grid' ? "grid-3" : "list-view"} style={{ gap: '32px' }}>
          {filtered.map((trip, i) => (
            <TripCard 
              key={trip._id} 
              trip={trip} 
              index={i} 
              isOwner={true} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
