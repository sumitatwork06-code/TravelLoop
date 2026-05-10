import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Filter, Clock, DollarSign, Star, Plus, MapPin, X } from 'lucide-react';

const TYPES = ['all', 'sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife'];

export default function ActivitySearchPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [maxCost, setMaxCost] = useState('');
  const [city, setCity] = useState('');
  const [myTrips, setMyTrips] = useState([]);
  const [showAddModal, setShowAddModal] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const params = {};
        if (city) params.city = city;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (maxCost) params.maxCost = maxCost;
        const { data } = await axios.get('/activities', { params });
        setActivities(data.activities || []);
        const tripsRes = await axios.get('/trips/my');
        setMyTrips(tripsRes.data.trips || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [city, typeFilter, maxCost]);

  const filtered = activities.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToTrip = async () => {
    if (!selectedTrip || !showAddModal) return;
    try {
      const trip = myTrips.find(t => t._id === selectedTrip);
      if (!trip) return;
      const stops = trip.stops || [];
      const stopIdx = selectedStop ? parseInt(selectedStop) : 0;
      if (stops[stopIdx]) {
        stops[stopIdx].activities = [...(stops[stopIdx].activities || []), {
          name: showAddModal.name, type: showAddModal.type,
          cost: showAddModal.cost, duration: showAddModal.duration
        }];
        await axios.put(`/trips/${selectedTrip}`, { stops: JSON.stringify(stops) });
        toast.success(`Added "${showAddModal.name}" to trip!`);
      } else {
        toast.error('Select a valid stop');
      }
    } catch { toast.error('Failed to add activity'); }
    finally { setShowAddModal(null); setSelectedTrip(''); setSelectedStop(''); }
  };

  const typeColors = { sightseeing: 'var(--gold)', food: 'var(--coral)', adventure: 'var(--teal)', culture: '#8b5cf6', shopping: '#ec4899', nightlife: '#6366f1' };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Discover Activities</h1><p className="page-subtitle">Find amazing things to do at every destination</p></div>
      </div>

      {/* Toolbar - Matching Screen 8 Wireframe */}
      <div className="toolbar animate-fade">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Group by</button>
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-outline btn-sm">Sort by...</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Results</h2>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:200, borderRadius:'var(--radius-md)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>No activities found</h3><p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid-list">
          {filtered.map((act, i) => (
            <div key={i} className="card wide-card animate-fade" style={{ animationDelay: `${i * 0.05}s`, padding: '16px' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flex: 1 }}>
                <div style={{ 
                  width: 140, 
                  height: 100, 
                  borderRadius: 12, 
                  background: 'var(--surface)', 
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border)'
                }}>
                  <img src={`https://images.unsplash.com/photo-1502602898657-3e917247a183?w=300&q=80&sig=${i}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--gold-dark)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{act.type}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--ink)' }}>{act.name}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {act.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {act.duration} min</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={14} /> ${act.cost}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowAddModal(act)} className="btn btn-primary" style={{ alignSelf: 'center', padding: '12px 24px' }}><Plus size={16} /> Add to Trip</button>
            </div>
          ))}
        </div>
      )}

      {/* Add to Trip Modal */}
      {showAddModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={() => setShowAddModal(null)}>
          <div className="card-static" style={{ padding:24, maxWidth:420, width:'100%', animation:'fadeInScale 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>Add to Trip</h3>
              <button onClick={() => setShowAddModal(null)} className="btn btn-icon btn-ghost"><X size={18} /></button>
            </div>
            <p style={{ color:'var(--text-secondary)', marginBottom:16 }}>Add <strong>{showAddModal.name}</strong> to one of your trips</p>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Select Trip</label>
              <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)}>
                <option value="">Choose a trip...</option>
                {myTrips.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
              </select>
            </div>
            {selectedTrip && (
              <div className="form-group" style={{ marginBottom:20 }}>
                <label className="form-label">Select Stop</label>
                <select value={selectedStop} onChange={e => setSelectedStop(e.target.value)}>
                  <option value="">Choose a stop...</option>
                  {(myTrips.find(t => t._id === selectedTrip)?.stops || []).map((s, i) => (
                    <option key={i} value={i}>{s.city}, {s.country}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowAddModal(null)} className="btn btn-outline" style={{ flex:1 }}>Cancel</button>
              <button onClick={handleAddToTrip} className="btn btn-primary" style={{ flex:1 }} disabled={!selectedTrip || !selectedStop}>Add Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
