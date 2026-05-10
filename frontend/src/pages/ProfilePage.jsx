import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Save, Trash2, MapPin, Calendar, Eye, Globe, Shield, Bell, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { id: profileId } = useParams();
  const { user: currentUser, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !profileId || profileId === currentUser?._id;
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('trips');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followProcessing, setFollowProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (isOwnProfile) {
          setProfile(currentUser);
          setForm({ 
            firstName: currentUser?.firstName || '', 
            lastName: currentUser?.lastName || '', 
            bio: currentUser?.bio || '', 
            city: currentUser?.city || '', 
            country: currentUser?.country || '', 
            phone: currentUser?.phone || '' 
          });
          const { data } = await axios.get('/trips/my');
          setTrips(data.trips || []);
        } else {
          const { data } = await axios.get(`/users/profile/${profileId}`);
          setProfile(data.user);
          setTrips(data.trips || []);
          if (currentUser) {
            setIsFollowing(data.user.followers?.includes(currentUser._id));
          }
        }
      } catch { toast.error('Profile not found'); }
      finally { setLoading(false); }
    })();
  }, [profileId, isOwnProfile, currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('/users/profile', form);
      if (setUser) setUser(data.user);
      setProfile(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleFollow = async () => {
    if (!currentUser) return navigate('/login');
    setFollowProcessing(true);
    try {
      const { data } = await axios.post(`/users/${profileId}/follow`);
      setIsFollowing(data.following);
      setProfile(prev => ({
        ...prev,
        followers: data.following
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }));
    } catch { toast.error('Follow action failed'); }
    finally { setFollowProcessing(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await axios.put('/users/avatar', fd);
      if (setUser) setUser(data.user);
      setProfile(data.user);
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    if (!window.confirm('This will permanently delete your account and all trips. Continue?')) return;
    try {
      await axios.delete('/users/account');
      logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch { toast.error('Delete failed'); }
  };

  const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : '?';

  if (loading) return <div className="page"><div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} /></div>;
  if (!profile) return <div className="page"><h3>Profile not found</h3></div>;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ position: 'relative', marginBottom: 100 }}>
        <div style={{ 
          height: 200, 
          background: 'linear-gradient(135deg, var(--ink), var(--teal))', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
        </div>
        
        <div style={{ 
          position: 'absolute', 
          top: 140, 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          padding: '0 20px'
        }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div className="sidebar-user-avatar" style={{ 
              width: 120, 
              height: 120, 
              fontSize: '2.5rem', 
              border: '6px solid white',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              {profile?.avatar ? <img src={profile.avatar} alt="" /> : initials}
            </div>
            {isOwnProfile && (
              <label style={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8, 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: 'var(--gold)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                border: '3px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <Camera size={16} color="var(--ink)" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink)' }}>
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '8px auto 20px' }}>
            {profile?.bio || 'No bio yet. Start sharing your adventures!'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 48, 
            marginBottom: 24,
            padding: '16px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            maxWidth: 500,
            margin: '0 auto 24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{trips.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Trips</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.followers?.length || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.following?.length || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Following</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {isOwnProfile ? (
              <>
                <button onClick={() => setEditing(true)} className="btn btn-primary" style={{ padding: '10px 24px' }}>Edit Profile</button>
                <button onClick={logout} className="btn btn-outline" style={{ padding: '10px 24px' }}>Logout</button>
              </>
            ) : (
              <button onClick={handleFollow} disabled={followProcessing} className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} style={{ padding: '10px 32px', gap: 8 }}>
                {isFollowing ? <><UserMinus size={18}/> Unfollow</> : <><UserPlus size={18}/> Follow</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 40px 40px', marginTop: 300 }}>
        {editing && (
          <div className="card-static" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Edit Profile</h3>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">First Name</label><input value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}><label className="form-label">Bio</label><textarea rows={2} value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about yourself..." /></div>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group"><label className="form-label">City</label><input value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Country</label><input value={form.country || ''} onChange={e => setForm({...form, country: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} className="btn btn-sm btn-outline">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['trips', 'settings'].filter(t => t !== 'settings' || isOwnProfile).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ 
              padding: '10px 20px', 
              fontWeight: 600, 
              fontSize: '0.9rem', 
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent', 
              color: tab === t ? 'var(--ink)' : 'var(--text-muted)', 
              cursor: 'pointer', 
              transition: 'all 0.2s', 
              textTransform: 'capitalize', 
              background: 'none' 
            }}>{t}</button>
          ))}
        </div>

        {tab === 'trips' && (
          trips.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✈️</div><h3>No trips yet</h3></div>
          ) : (
            <div className="grid-3">
              {trips.map(trip => (
                <Link key={trip._id} to={`/trips/${trip._id}`} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <img src={trip.coverImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>{trip.title}</h4>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {trip.views || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {trip.stops?.length || 0} stops</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'settings' && isOwnProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
            <div className="card-static" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} /> Preferences</h3>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">Language</label>
                  <select defaultValue="en"><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="ja">日本語</option></select>
                </div>
                <div className="form-group"><label className="form-label">Currency</label>
                  <select defaultValue="USD"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option><option value="JPY">JPY (¥)</option></select>
                </div>
              </div>
            </div>
            <div className="card-static" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={16} /> Notifications</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 'auto' }} /> Email notifications for trip updates
              </label>
            </div>
            <div className="card-static" style={{ padding: 20, border: '1px solid rgba(224,92,75,0.2)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--coral)' }}><Shield size={16} /> Danger Zone</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Once you delete your account, there is no going back.</p>
              <button onClick={handleDeleteAccount} className="btn btn-sm btn-danger"><Trash2 size={14} /> Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
