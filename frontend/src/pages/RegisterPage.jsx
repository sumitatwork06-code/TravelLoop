import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Compass, ArrowRight, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', zip: '', city: '', country: '', tripInterest: '', travelDuration: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return toast.error('Fill in all required fields');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      // Mapping fullName back to firstName for backend if needed, or sending as is
      const [firstName, ...lastNameParts] = form.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      await register({ ...form, firstName, lastName });
      toast.success('Account created! Welcome to Traveloop 🌍');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left */}
      <div className="auth-hero">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(45,138,122,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(201,168,76,0.1) 0%, transparent 50%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sidebar-logo-icon" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Compass size={24} color="var(--ink)" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>Traveloop</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 }}>JOIN THE COMMUNITY</div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
            Start your<br />journey with<br /><span style={{ color: 'var(--gold)' }}>us today.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 360 }}>
            Join thousands of travelers who plan, discover, and share their adventures using Traveloop.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? 'var(--gold)' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 8 }}>Step {step} of 2</p>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          {/* Mobile logo */}
          <div style={{ display:'none', marginBottom:32, justifyContent:'center' }} className="auth-mobile-logo">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="sidebar-logo-icon"><Compass size={20} color="var(--ink)" strokeWidth={2.5} /></div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.3rem' }}>Traveloop</span>
            </div>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
              {step === 1 ? 'Create your account' : 'Tell us more'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {step === 1 ? 'Join the world of explorers' : 'Help us personalize your experience'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="John Doe" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={{ paddingLeft: 36 }} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: 36 }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Trip Interest</label>
                  <input type="text" placeholder="e.g. Adventure" value={form.tripInterest} onChange={e => setForm({ ...form, tripInterest: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Travel Duration</label>
                  <input type="text" placeholder="e.g. 2 weeks" value={form.travelDuration} onChange={e => setForm({ ...form, travelDuration: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Zip Code</label>
                  <input type="text" placeholder="12345" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="India" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={{ paddingLeft: 36 }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tell more about yourself</label>
                <textarea placeholder="Share your travel style..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} style={{ resize: 'none' }} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px', marginTop: 4 }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: 36, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={{ paddingLeft: 36 }} />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <span className="form-error">Passwords don't match</span>
                )}
              </div>

              {/* Password strength */}
              {form.password && (
                <div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, transition: 'all 0.3s',
                      width: form.password.length < 6 ? '25%' : form.password.length < 10 ? '60%' : '100%',
                      background: form.password.length < 6 ? 'var(--coral)' : form.password.length < 10 ? 'var(--gold)' : 'var(--teal)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: form.password.length < 6 ? 'var(--coral)' : form.password.length < 10 ? 'var(--gold-dark)' : 'var(--teal)' }}>
                    {form.password.length < 6 ? 'Weak' : form.password.length < 10 ? 'Good' : 'Strong'} password
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, padding: '14px' }}>
                  {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <><span>Create Account</span> <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 24 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}