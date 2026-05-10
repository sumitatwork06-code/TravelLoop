import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Compass, ArrowRight, Mail, Lock } from 'lucide-react';

const destinations = ['Paris 🗼', 'Tokyo ⛩️', 'Bali 🌴', 'Rome 🏛️', 'Santorini 🌅', 'Dubai 🏙️', 'Bangkok 🙏', 'London 🎡'];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, explorer! 🌍');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      {/* Left Hero */}
      <div className="auth-hero">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,168,76,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,138,122,0.1) 0%, transparent 50%)' }} />
        {[80,120,60,90,110,70].map((size, i) => (
          <div key={i} style={{ position:'absolute', width:size, height:size, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.15)', top:['10%','30%','60%','80%','20%','70%'][i], left:['15%','70%','20%','65%','45%','85%'][i], animation:`float ${3+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }} />
        ))}
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
          <div className="sidebar-logo-icon" style={{ width:44, height:44, borderRadius:12 }}><Compass size={24} color="var(--ink)" strokeWidth={2.5} /></div>
          <span style={{ fontFamily:'var(--font-display)', color:'white', fontSize:'1.4rem', fontWeight:700 }}>Traveloop</span>
        </div>
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ color:'rgba(255,255,255,0.3)', fontFamily:'var(--font-mono)', fontSize:'0.7rem', letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>YOUR NEXT DESTINATION</div>
          <h1 style={{ fontFamily:'var(--font-display)', color:'white', fontSize:'clamp(2rem,3.5vw,3.5rem)', fontWeight:700, lineHeight:1.1, marginBottom:24 }}>
            Every journey<br />begins with a<br /><span style={{ color:'var(--gold)' }}>single step.</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1rem', lineHeight:1.7, maxWidth:380 }}>
            Plan, organize and share your travel adventures with the world. Build beautiful itineraries and stay within budget.
          </p>
          <div style={{ marginTop:48, overflow:'hidden' }}>
            <div style={{ display:'flex', gap:12, animation:'marquee 20s linear infinite' }}>
              {[...destinations, ...destinations].map((d, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 16px', color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', whiteSpace:'nowrap', flexShrink:0 }}>{d}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position:'relative', zIndex:1, display:'flex', gap:32 }}>
          {[['10K+','Travelers'],['50+','Countries'],['100K+','Trips Planned']].map(([n,l]) => (
            <div key={l}><div style={{ color:'var(--gold)', fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700 }}>{n}</div><div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem' }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-form-container" style={{ animation:'fadeIn 0.5s ease' }}>
          {/* Mobile logo */}
          <div style={{ display:'none', marginBottom:32, justifyContent:'center' }} className="auth-mobile-logo">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="sidebar-logo-icon"><Compass size={20} color="var(--ink)" strokeWidth={2.5} /></div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.3rem' }}>Traveloop</span>
            </div>
          </div>
          <div style={{ marginBottom:40 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:700, color:'var(--ink)', marginBottom:8 }}>Welcome back</h2>
            <p style={{ color:'var(--text-secondary)' }}>Sign in to continue your adventures</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ paddingLeft:40 }} />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize:'0.8rem', color:'var(--gold-dark)', fontWeight:500 }}>Forgot password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingLeft:40, paddingRight:44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding:'14px 24px', marginTop:4 }}>
              {loading ? <div style={{ width:18, height:18, border:'2px solid rgba(201,168,76,0.3)', borderTopColor:'var(--gold)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
          <div className="divider" style={{ margin:'28px 0' }}>or</div>
          <button onClick={() => setForm({ email:'demo@traveloop.com', password:'demo123' })} className="btn btn-outline btn-full" style={{ marginBottom:24 }}>Try Demo Account</button>
          <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:'0.9rem' }}>
            New to Traveloop? <Link to="/register" style={{ color:'var(--gold-dark)', fontWeight:600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}