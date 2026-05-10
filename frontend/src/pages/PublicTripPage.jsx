import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, DollarSign, Copy, Share2, Heart, Eye, Compass } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200';

export default function PublicTripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await axios.get(`/trips/${id}`); setTrip(data.trip); }
      catch { /* public page - no redirect */ }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleCopy = async () => {
    try {
      await axios.post(`/trips/${id}/copy`);
      toast.success('Trip copied to your account! 🎉');
    } catch (err) {
      if (err.response?.status === 401) toast.error('Login to copy this trip');
      else toast.error('Copy failed');
    }
  };

  const shareUrl = window.location.href;
  const shareOn = (platform) => {
    const text = `Check out this amazing trip: ${trip?.title}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)' }}>
      <div style={{ width:48, height:48, border:'3px solid var(--border)', borderTopColor:'var(--gold)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!trip) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'3rem' }}>🔍</div>
      <h2 style={{ fontFamily:'var(--font-display)' }}>Trip not found</h2>
      <p style={{ color:'var(--text-secondary)' }}>This trip may have been removed or is private</p>
    </div>
  );

  const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000);

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface)' }}>
      {/* Header */}
      <div style={{ padding:'16px 24px', background:'var(--surface-card)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="sidebar-logo-icon"><Compass size={18} color="var(--ink)" strokeWidth={2.5} /></div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.1rem' }}>Traveloop</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleCopy} className="btn btn-sm btn-gold"><Copy size={14} /> Copy Trip</button>
          <button onClick={copyLink} className="btn btn-sm btn-outline"><Share2 size={14} /> Share</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position:'relative', height:'clamp(200px, 40vw, 360px)', overflow:'hidden' }}>
        <img src={trip.coverImage || FALLBACK} alt={trip.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
        <div style={{ position:'absolute', bottom:32, left:32, right:32 }}>
          <h1 style={{ fontFamily:'var(--font-display)', color:'white', fontSize:'clamp(1.5rem,4vw,2.5rem)', fontWeight:700, marginBottom:8 }}>{trip.title}</h1>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', color:'rgba(255,255,255,0.8)', fontSize:'0.85rem' }}>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={13} /> {format(new Date(trip.startDate),'MMM d')} – {format(new Date(trip.endDate),'MMM d, yyyy')}</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={13} /> {trip.stops?.length || 0} stops</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={13} /> {days} days</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><Eye size={13} /> {trip.views} views</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>
        {/* Author + Social */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="sidebar-user-avatar" style={{ width:44, height:44 }}>{trip.author?.firstName?.[0]}{trip.author?.lastName?.[0]}</div>
            <div><div style={{ fontWeight:600 }}>{trip.author?.firstName} {trip.author?.lastName}</div><div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{trip.author?.city || 'Explorer'}</div></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => shareOn('twitter')} className="btn btn-sm btn-outline">𝕏</button>
            <button onClick={() => shareOn('whatsapp')} className="btn btn-sm btn-outline" style={{ color:'#25d366' }}>WhatsApp</button>
            <button onClick={() => shareOn('facebook')} className="btn btn-sm btn-outline" style={{ color:'#1877f2' }}>Facebook</button>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="card-static" style={{ padding:24, marginBottom:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', marginBottom:8 }}>About this trip</h3>
            <p style={{ color:'var(--text-secondary)', lineHeight:1.8 }}>{trip.description}</p>
          </div>
        )}

        {/* Itinerary */}
        {trip.stops?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', marginBottom:16 }}>Itinerary ({trip.stops.length} stops)</h3>
            <div className="timeline">
              {trip.stops.map((stop, i) => (
                <div key={i} className="timeline-item">
                  <div className="card-static" style={{ padding:16 }}>
                    <h4 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:4 }}>{stop.city}, {stop.country}</h4>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:8 }}>{format(new Date(stop.startDate),'MMM d')} – {format(new Date(stop.endDate),'MMM d')}</div>
                    {stop.activities?.length > 0 && (
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {stop.activities.map((a, j) => <span key={j} className="tag" style={{ fontSize:'0.75rem' }}>{a.name}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {trip.tags?.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {trip.tags.map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
