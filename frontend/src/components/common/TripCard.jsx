import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, DollarSign, Heart, Eye, Share2, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
];

export default function TripCard({ trip, index = 0, isOwner = false, onLike, onDelete }) {
  const navigate = useNavigate();
  const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) || 1;
  const isLiked = onLike && trip.likes?.includes(localStorage.getItem('userId')); // Simplified for shared component

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/trips/${trip._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="card-static animate-fade" style={{ 
      padding: 0, 
      borderRadius: 24, 
      overflow: 'hidden', 
      animationDelay: `${index * 0.05}s`,
      background: 'white',
      border: '1px solid var(--border)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: 'fit-content'
    }}>
      <Link to={`/trips/${trip._id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        {/* Cover Image Section - Reduced height for compactness */}
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          <img 
            src={trip.coverImage || COVER_FALLBACKS[index % COVER_FALLBACKS.length]} 
            alt={trip.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            className="card-img"
          />
          
          {/* Top Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
            {trip.season && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--ink)', fontSize: '0.6rem', fontWeight: 800 }}>
                {trip.season}
              </span>
            )}
          </div>

          <button 
            onClick={handleShare}
            className="badge" 
            style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', color: 'var(--ink)', padding: '6px', border: 'none', cursor: 'pointer' }}
          >
            <Share2 size={14} />
          </button>

          {/* Author Avatar (for Community) */}
          {!isOwner && trip.author && (
            <div style={{ position: 'absolute', bottom: -12, left: 16, zIndex: 10 }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                background: 'white', 
                border: '2px solid var(--gold)', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                {trip.author.avatar ? (
                  <img src={trip.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>{trip.author.firstName?.[0]}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Tightened */}
        <div style={{ padding: '12px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 2, color: 'var(--ink)', lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {trip.title}
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, color: 'var(--text-muted)', fontSize: '0.68rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} /> {days}d</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {trip.stops?.length || 0}s</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><DollarSign size={11} /> ${trip.totalBudget || 0}</span>
            </div>
          </div>
          
          {/* Stats & Actions - Tightened */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                   <Heart size={12} /> {trip.likes?.length || 0}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                   <Eye size={12} /> {trip.views || 0}
                </div>
             </div>
             
             {isOwner ? (
               <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={(e) => { e.preventDefault(); navigate(`/trips/${trip._id}/itinerary`); }}
                  className="btn btn-icon btn-sm btn-primary" 
                  style={{ width: 28, height: 28, padding: 0, borderRadius: 8 }}
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    if(window.confirm('Are you sure you want to delete this journey?')) onDelete(trip._id); 
                  }}
                  className="btn btn-icon btn-sm" 
                  style={{ width: 28, height: 28, padding: 0, borderRadius: 8, background: 'rgba(224,92,75,0.1)', color: 'var(--coral)', border: 'none' }}
                >
                  <Trash2 size={13} />
                </button>
               </div>
             ) : (
               <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)' }}>
                 ${Math.round(trip.totalBudget / days)}<span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)' }}>/d</span>
               </div>
             )}
          </div>
        </div>
      </Link>
    </div>

  );
}
