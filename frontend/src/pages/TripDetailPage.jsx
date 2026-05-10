import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, MapPin, Heart, Eye, Share2, Bookmark, Edit3, DollarSign, CheckSquare, FileText, Map, Plus } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200';

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await axios.get(`/trips/${id}`);
        setTrip(data.trip);
        setLiked(data.trip.likes?.includes(user?._id));
      } catch (err) { 
        toast.error('Trip not found'); 
        navigate('/my-trips'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchTrip();
  }, [id, user?._id, navigate]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    try {
      const { data } = await axios.post(`/trips/${id}/like`);
      setLiked(data.liked);
      setTrip(prev => ({ 
        ...prev, 
        likes: data.liked 
          ? [...(prev.likes || []), user._id] 
          : (prev.likes || []).filter(l => l !== user._id) 
      }));
    } catch (err) {}
  };

  const handleShare = () => {
    const url = `${window.location.origin}/trip/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  if (loading) return (
    <div className="page">
      <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)', marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8 }} />
    </div>
  );
  
  if (!trip) return null;

  const isOwner = user?._id === (trip.author?._id || trip.author);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        <img src={trip.coverImage || FALLBACK} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,17,40,0.8) 0%, transparent 70%)' }} />
        <button onClick={() => navigate(-1)} style={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          background: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(8px)', 
          border: '1px solid rgba(255,255,255,0.2)', 
          color: 'white', 
          borderRadius: 12, 
          padding: '8px 16px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          fontWeight: 600
        }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '2.8rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{trip.title}</h1>
          <div style={{ display: 'flex', gap: 24, color: 'rgba(255,255,255,1)', fontSize: '1rem', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={18} /> {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
            {trip.stops?.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={18} /> {trip.stops.length} destinations</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={18} /> {trip.views || 0} views</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 40px', marginTop: -40, position: 'relative', zIndex: 20 }}>
        <div className="card-static" style={{ 
          padding: '32px 48px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          background: 'white',
          borderRadius: 28,
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: 50 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Duration</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)} Days</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Total Budget</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>₹{trip.totalBudget?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Stops</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{trip.stops?.length || 0} Cities</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ gap: 8, padding: '12px 24px', borderRadius: 12 }}><Map size={18} /> View on Map</button>
            <button onClick={handleShare} className="btn btn-outline" style={{ width: 48, padding: 0, justifyContent: 'center', borderRadius: 12 }}><Share2 size={20} /></button>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        {/* Actions bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
          {isOwner ? (
            <>
              <Link to={`/trips/${id}/itinerary`} className="btn btn-outline" style={{ gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}><Edit3 size={18} /> Edit Itinerary</Link>
              <Link to={`/trips/${id}/budget`} className="btn btn-outline" style={{ gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}><DollarSign size={18} /> Budget & Costs</Link>
              <Link to={`/trips/${id}/packing`} className="btn btn-outline" style={{ gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}><CheckSquare size={18} /> Packing List</Link>
              <Link to={`/trips/${id}/notes`} className="btn btn-outline" style={{ gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}><FileText size={18} /> Travel Notes</Link>
            </>
          ) : (
            <Link to={`/trips/${id}/budget`} className="btn btn-outline" style={{ gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}><DollarSign size={18} /> Budget & Costs</Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
          {/* Main: Timeline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>Itinerary Timeline</h3>
              {isOwner && (
                <button onClick={() => navigate(`/trips/${id}/itinerary`)} className="btn btn-ghost" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  <Plus size={18} /> Add Stop
                </button>
              )}
            </div>
            
            <div style={{ position: 'relative', paddingLeft: 40 }}>
              {/* Vertical Line */}
              <div style={{ position: 'absolute', left: 8, top: 24, bottom: 24, width: 2, background: 'var(--border)', borderLeft: '2px dashed var(--border)' }} />
              
              {trip.stops?.length > 0 ? trip.stops.map((stop, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: 48 }}>
                  {/* Dot */}
                  <div style={{ 
                    position: 'absolute', 
                    left: -40, 
                    top: 6, 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    background: 'white', 
                    border: '5px solid var(--primary)',
                    zIndex: 2,
                    boxShadow: '0 0 0 4px white'
                  }} />
                  
                  <div className="card-static" style={{ padding: 28, borderRadius: 20, boxShadow: 'var(--shadow-sm)', cursor: isOwner ? 'pointer' : 'default' }} onClick={() => {
                    if (isOwner) navigate(`/trips/${id}/itinerary`);
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>{stop.city}, {stop.country}</h4>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, fontWeight: 500 }}>
                          {format(new Date(stop.startDate), 'MMMM d')} – {format(new Date(stop.endDate), 'MMMM d, yyyy')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>₹{stop.transportCost || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Transport</div>
                      </div>
                    </div>

                    {/* Stop Notes */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                      {isOwner ? (
                        <textarea 
                          placeholder="Add notes for this stop..." 
                          value={stop.notes || ''} 
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const updatedStops = [...trip.stops];
                            updatedStops[i].notes = e.target.value;
                            setTrip({ ...trip, stops: updatedStops });
                          }}
                          onBlur={() => axios.put(`/trips/${id}`, { stops: JSON.stringify(trip.stops) })}
                          style={{ width: '100%', minHeight: '60px', padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stop.notes || 'No notes for this stop.'}</p>
                      )}
                    </div>
                    
                    {stop.activities?.length > 0 && (
                      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {stop.activities.map((a, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--surface)', borderRadius: 14 }}>
                            <div style={{ fontSize: '1.2rem' }}>{a.type === 'food' ? '🍲' : a.type === 'adventure' ? '🧗' : '🏛️'}</div>
                            <div style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{a.name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{a.duration} min · ₹{a.cost}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )) : (

                <div style={{ padding: 60, textAlign: 'center', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🗺️</div>
                  <h3 style={{ marginBottom: 8 }}>Your itinerary is empty</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start planning your adventure by adding your first stop.</p>
                  {isOwner && <button onClick={() => navigate(`/trips/${id}/itinerary`)} className="btn btn-primary" style={{ padding: '12px 32px' }}>Start Planning</button>}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* About */}
            {trip.description && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>About this trip</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>{trip.description}</p>
              </div>
            )}
            
            {/* Author */}
            <div className="card-static" style={{ padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Created By</div>
              <Link to={`/profile/${trip.author?._id || trip.author}`} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="sidebar-user-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem', border: '2px solid var(--primary-light)' }}>
                  {trip.author?.avatar ? <img src={trip.author.avatar} alt="" /> : `${trip.author?.firstName?.[0] || ''}${trip.author?.lastName?.[0] || ''}`}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>{trip.author?.firstName} {trip.author?.lastName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{trip.author?.city || 'World Traveler'}</div>
                </div>
              </Link>
            </div>

            {/* Trip Details */}
            <div className="card-static" style={{ padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Trip Insights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Status', trip.status || 'Planning'],
                  ['Style', trip.travelStyle || 'Not set'],
                  ['Season', trip.season || 'Not set'],
                  ['Visibility', trip.visibility || 'Private']
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontWeight: 800, textTransform: 'capitalize', color: 'var(--ink)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {trip.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {trip.tags.map(tag => <span key={tag} className="tag" style={{ background: 'var(--surface)', fontWeight: 600, padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem' }}>#{tag}</span>)}
              </div>
            )}
            
            <button onClick={handleLike} className="btn btn-outline" style={{ width: '100%', height: 50, borderRadius: 12, gap: 10, border: liked ? '1.5px solid var(--coral)' : '1.5px solid var(--border)', color: liked ? 'var(--coral)' : 'var(--text-secondary)' }}>
              <Heart size={20} fill={liked ? 'var(--coral)' : 'none'} /> 
              {liked ? 'Liked this trip' : 'Like this trip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
