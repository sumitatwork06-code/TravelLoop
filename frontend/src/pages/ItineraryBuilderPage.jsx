import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stops, setStops] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newStop, setNewStop] = useState({ city: '', country: '', startDate: '', endDate: '', notes: '', transportCost: 0 });
  const [newActivity, setNewActivity] = useState({ name: '', type: 'sightseeing', cost: 0, duration: 60 });
  const [activeStop, setActiveStop] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/trips/${id}`);
        setTrip(data.trip);
        setStops(data.trip.stops || []);
      } catch { navigate('/my-trips'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const addStop = () => {
    if (!newStop.city || !newStop.country || !newStop.startDate || !newStop.endDate) return toast.error('Fill city, country and dates');
    setStops([...stops, { ...newStop, activities: [] }]);
    setNewStop({ city: '', country: '', startDate: '', endDate: '', notes: '', transportCost: 0 });
    setShowAdd(false);
    toast.success('Stop added!');
  };

  const removeStop = (i) => { setStops(stops.filter((_, idx) => idx !== i)); if (activeStop === i) setActiveStop(null); };

  const addActivity = (stopIdx) => {
    if (!newActivity.name) return toast.error('Activity name required');
    const updated = [...stops];
    updated[stopIdx].activities = [...(updated[stopIdx].activities || []), { ...newActivity }];
    setStops(updated);
    setNewActivity({ name: '', type: 'sightseeing', cost: 0, duration: 60 });
    toast.success('Activity added!');
  };

  const removeActivity = (stopIdx, actIdx) => {
    const updated = [...stops];
    updated[stopIdx].activities.splice(actIdx, 1);
    setStops(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/trips/${id}`, { stops: JSON.stringify(stops) });
      toast.success('Itinerary saved! ✅');
    } catch (err) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} /></div>;

  return (
    <div style={{ padding: 40, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn btn-ghost" style={{ gap: 6 }}><ArrowLeft size={16} /> Back</button>
          <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>Itinerary Builder</h1><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{trip?.title}</p></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(true)} className="btn btn-outline" style={{ gap: 6 }}><Plus size={16} /> Add Stop</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-gold" style={{ gap: 6 }}>{saving ? 'Saving...' : <><Save size={16} /> Save</>}</button>
        </div>
      </div>

      {/* Add stop form */}
      {showAdd && (
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Add New Stop</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">City *</label><input placeholder="Paris" value={newStop.city} onChange={e => setNewStop({ ...newStop, city: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Country *</label><input placeholder="France" value={newStop.country} onChange={e => setNewStop({ ...newStop, country: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Start Date *</label><input type="date" value={newStop.startDate} onChange={e => setNewStop({ ...newStop, startDate: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">End Date *</label><input type="date" value={newStop.endDate} onChange={e => setNewStop({ ...newStop, endDate: e.target.value })} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setShowAdd(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button onClick={addStop} className="btn btn-primary" style={{ flex: 1 }}>Add Stop</button>
          </div>
        </div>
      )}

      {/* Stops list */}
      {stops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No stops yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Add your first destination to build your itinerary</p>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus size={16} /> Add First Stop</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {stops.map((stop, i) => (
            <div key={i} style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: activeStop === i ? '2px solid var(--gold)' : '1px solid var(--border)', overflow: 'hidden' }}>
              <div onClick={() => setActiveStop(activeStop === i ? null : i)} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', background: activeStop === i ? 'var(--cream)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{stop.city}, {stop.country}</h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stop.startDate} → {stop.endDate} · {stop.activities?.length || 0} activities</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeStop(i); }} style={{ color: 'var(--coral)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>

              {activeStop === i && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 16, marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Estimated Costs</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Transport</label>
                        <input type="number" value={stop.transportCost || ''} onChange={e => {
                          const updated = [...stops]; updated[i].transportCost = Number(e.target.value); setStops(updated);
                        }} placeholder="Transport price" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Accommodation</label>
                        <input type="number" value={stop.accommodation?.cost || ''} onChange={e => {
                          const updated = [...stops]; updated[i].accommodation = { ...updated[i].accommodation, cost: Number(e.target.value) }; setStops(updated);
                        }} placeholder="Accommodation price" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Food</label>
                        <input type="number" value={stop.foodCost || ''} onChange={e => {
                          const updated = [...stops]; updated[i].foodCost = Number(e.target.value); setStops(updated);
                        }} placeholder="Food price" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Activities Cost</label>
                        <input type="number" value={stop.activitiesCost || ''} onChange={e => {
                          const updated = [...stops]; updated[i].activitiesCost = Number(e.target.value); setStops(updated);
                        }} placeholder="Activity total price" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Activities</h4>
                    {stop.activities?.map((act, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--cream)', borderRadius: 8, marginBottom: 6 }}>
                        <div><span style={{ fontWeight: 500 }}>{act.name}</span><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>{act.type} · ${act.cost} · {act.duration}min</span></div>
                        <button onClick={() => removeActivity(i, j)} style={{ color: 'var(--coral)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
                      <input placeholder="Activity name" value={newActivity.name} onChange={e => setNewActivity({ ...newActivity, name: e.target.value })} style={{ fontSize: '0.85rem' }} />
                      <select value={newActivity.type} onChange={e => setNewActivity({ ...newActivity, type: e.target.value })} style={{ fontSize: '0.85rem' }}>
                        {['sightseeing','food','adventure','culture','shopping','nightlife','other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="number" placeholder="Activity price" value={newActivity.cost || ''} onChange={e => setNewActivity({ ...newActivity, cost: Number(e.target.value) })} style={{ fontSize: '0.85rem' }} />
                      <input type="number" placeholder="Activity time (min)" value={newActivity.duration || ''} onChange={e => setNewActivity({ ...newActivity, duration: Number(e.target.value) })} style={{ fontSize: '0.85rem' }} />
                      <button onClick={() => addActivity(i)} className="btn btn-sm btn-primary"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
