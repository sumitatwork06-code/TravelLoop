import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, List, CalendarDays, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ItineraryViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // timeline | calendar

  useEffect(() => {
    (async () => {
      try { const { data } = await axios.get(`/trips/${id}`); setTrip(data.trip); }
      catch { navigate('/my-trips'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="page"><div className="skeleton" style={{ height:300, borderRadius:'var(--radius-md)' }} /></div>;
  if (!trip) return null;

  const isOwner = user?._id === (trip.author?._id || trip.author);
  const allDays = trip.startDate && trip.endDate ? eachDayOfInterval({ start: new Date(trip.startDate), end: new Date(trip.endDate) }) : [];

  const getStopForDay = (day) => trip.stops?.find(s => {
    const sd = new Date(s.startDate), ed = new Date(s.endDate);
    return day >= sd && day <= ed;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div>
            <h1 className="page-title">Itinerary</h1>
            <p className="page-subtitle">{trip.title}</p>
          </div>
        </div>
      </div>

      {/* Toolbar - Matching Screen 9 Wireframe */}
      <div className="toolbar animate-fade">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search activities..." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Group by</button>
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-outline btn-sm">Sort by...</button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Itinerary for a selected place</h2>
      </div>

      {/* Trip summary bar */}
      <div className="card-static" style={{ padding:'16px 24px', marginBottom:32, display:'flex', gap:24, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)' }}><Calendar size={14} /> {format(new Date(trip.startDate),'MMM d')} – {format(new Date(trip.endDate),'MMM d, yyyy')}</span>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)' }}><MapPin size={14} /> {trip.stops?.length || 0} stops</span>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)' }}><Clock size={14} /> {allDays.length} days</span>
        <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--text-secondary)' }}><DollarSign size={14} /> {trip.totalBudget || 0} {trip.currency}</span>
      </div>

      {trip.stops?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <h3>No itinerary yet</h3><p>Add stops to build your travel plan</p>
          {isOwner && <Link to={`/trips/${id}/itinerary`} className="btn btn-primary"><Edit3 size={14} /> Build Itinerary</Link>}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div className="itinerary-header-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 180px', gap: 20, marginBottom: -20, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            <div />
            <div style={{ textAlign: 'center' }}>Physical Activity</div>
            <div style={{ textAlign: 'center' }}>Expense</div>
          </div>

          {trip.stops.map((stop, i) => (
            <div key={i} className="itinerary-stop-row" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="itinerary-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 180px', gap: 20, alignItems: 'start' }}>
                {/* Day Badge */}
                <div style={{ padding: '10px 20px', background: 'var(--surface-card)', border: '2px solid var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 800, textAlign: 'center' }}>
                  Day {i + 1}
                </div>

                {/* Activities and Expenses */}
                <div className="itinerary-activities" style={{ display: 'flex', flexDirection: 'column', gap: 20, gridColumn: 'span 2' }}>
                  {stop.activities?.map((act, j) => (
                    <React.Fragment key={j}>
                      <div className="itinerary-activity-item" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 20, alignItems: 'center' }}>
                        <div className="card" style={{ padding: 20, textAlign: 'center', border: '2px solid var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                          {act.name}
                        </div>
                        <div className="card" style={{ padding: 20, textAlign: 'center', border: '2px solid var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                          ${act.cost || 0}
                        </div>
                      </div>
                      {j < stop.activities.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 'calc(100% - 200px)' }}>
                          <ArrowLeft size={24} style={{ transform: 'rotate(-90deg)', color: 'var(--text-primary)' }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  {!stop.activities?.length && (
                    <div className="card" style={{ padding: 20, textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                      No physical activities planned for this stop
                    </div>
                  )}
                </div>
              </div>
              {i < trip.stops.length - 1 && (
                 <div style={{ display: 'flex', justifyContent: 'center', marginLeft: 'clamp(0px, 10vw, 120px)' }}>
                    <ArrowLeft size={32} style={{ transform: 'rotate(-90deg)', color: 'var(--text-primary)', margin: '10px 0' }} />
                 </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {allDays.map((day, i) => {
            const stop = getStopForDay(day);
            return (
              <div key={i} className="card-static" style={{ padding:'14px 20px', display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ width:60, textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--ink)' }}>{format(day,'d')}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase' }}>{format(day,'EEE')}</div>
                </div>
                <div style={{ width:1, height:36, background:'var(--border)' }} />
                {stop ? (
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:2 }}><MapPin size={12} style={{ display:'inline' }} /> {stop.city}, {stop.country}</div>
                    {stop.activities?.length > 0 && (
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {stop.activities.map((a, j) => <span key={j} className="tag" style={{ fontSize:'0.72rem' }}>{a.name}</span>)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ flex:1, color:'var(--text-muted)', fontSize:'0.85rem', fontStyle:'italic' }}>Free day — no activities planned</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
