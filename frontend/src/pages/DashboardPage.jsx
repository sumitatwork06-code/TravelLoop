import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, isFuture, isPast } from 'date-fns';
import { Plus, ArrowRight, MapPin, TrendingUp, Sparkles, DollarSign } from 'lucide-react';
import TripCard from '../components/common/TripCard';

const COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
];

const SEASONAL = [
  { city: 'Kyoto', season: 'Spring', desc: 'Cherry blossom season in full bloom', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', emoji: '🌸' },
  { city: 'Santorini', season: 'Summer', desc: 'Perfect Mediterranean sunshine', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600', emoji: '☀️' },
  { city: 'New England', season: 'Autumn', desc: 'Stunning fall foliage & colors', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', emoji: '🍂' },
  { city: 'Lapland', season: 'Winter', desc: 'Northern lights & snowy magic', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600', emoji: '❄️' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState([]);
  const [communityTrips, setCommunityTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myRes, commRes] = await Promise.all([
          axios.get('/trips/my'),
          axios.get('/trips?limit=6&sort=trending')
        ]);
        setMyTrips(myRes.data.trips || []);
        setCommunityTrips(commRes.data.trips || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalDays = myTrips.reduce((sum, t) => sum + Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / 86400000), 0);
  const totalBudget = myTrips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

  if (loading) return (
    <div className="page">
      <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8, marginBottom: 24 }} />
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-md)' }} />)}
      </div>
      <div className="grid-2">{[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-md)' }} />)}</div>
    </div>
  );

  return (
    <div className="page" style={{ padding: '0 0 40px' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden', marginBottom: 40 }}>
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600"
          alt="Adventure"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center', color: 'white' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-main)', 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
            fontWeight: 900, 
            marginBottom: 24, 
            color: '#ffffff',
            letterSpacing: '-0.04em',
            textShadow: '0 4px 15px rgba(0,0,0,0.4)',
            lineHeight: 1.1
          }}>
            Find your next adventure
          </h1>
          <div className="card-static" style={{ width: '100%', maxWidth: '600px', background: 'white', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', gap: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <form onSubmit={(e) => { e.preventDefault(); navigate(`/cities?search=${encodeURIComponent(e.target.search.value)}`); }} style={{ flex: 1, display: 'flex', gap: 8, width: '100%' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={20} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
                <input name="search" placeholder="Search countries or cities..." style={{ border: 'none', paddingLeft: 48, background: 'transparent', height: '48px', width: '100%' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 32px' }}>Search</button>
            </form>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 40px 40px', marginTop: 40 }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{format(new Date(), 'EEEE, MMMM d')}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{greeting()}, {user?.firstName} 👋</h2>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{myTrips.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Trips</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalDays}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Days Travelled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, padding: '0 40px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>My Journeys</h2>
            <Link to="/my-trips" style={{ color: 'var(--gold-dark)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>See all <ArrowRight size={16} /></Link>
          </div>

          {myTrips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✈️</div>
              <h3>No trips yet</h3><p>Create your first trip to get started!</p>
              <button onClick={() => navigate('/trips/create')} className="btn btn-primary"><Plus size={16} /> Create Trip</button>
            </div>
          ) : (
            <div className="grid-2" style={{ marginBottom: 60 }}>
              {myTrips.slice(0, 4).map((trip, i) => (
                <TripCard key={trip._id} trip={trip} index={i} isOwner={true} />
              ))}
            </div>
          )}

          {communityTrips.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><TrendingUp size={24} /> Trending Now</h2>
                <Link to="/community" style={{ color: 'var(--gold-dark)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>Explore <ArrowRight size={16} /></Link>
              </div>
              <div className="grid-2" style={{ marginBottom: 40 }}>
                {communityTrips.slice(0, 4).map((trip, i) => (
                  <TripCard key={trip._id} trip={trip} index={i} onLike={() => { }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Seasonal Picks */}
          <div className="card-static" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color="var(--gold)" /> Seasonal Picks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SEASONAL.map(s => (
                <div key={s.city} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={s.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>{s.emoji} {s.city} <span className="badge" style={{ background: 'var(--cream)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{s.season}</span></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Highlight */}
          {totalBudget > 0 && (
            <div className="card-static" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} color="var(--teal)" /> Budget Overview</h3>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)' }}>${totalBudget.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Total across {myTrips.length} trips</div>
              <div style={{ height: 6, background: 'var(--cream)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, var(--teal), var(--gold))', borderRadius: 3 }} />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card-static" style={{ padding: 20, background: 'var(--ink)', borderColor: 'transparent' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: 4 }}>Quick Actions</h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Get started with your next adventure</p>
            {[
              { label: 'Plan a New Trip', to: '/trips/create', icon: '✈️' },
              { label: 'Explore Cities', to: '/cities', icon: '🌍' },
              { label: 'Community Feed', to: '/community', icon: '👥' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 8, transition: 'all 0.2s', color: 'white', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{a.icon} {a.label}</span>
                <ArrowRight size={14} color="var(--gold)" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
