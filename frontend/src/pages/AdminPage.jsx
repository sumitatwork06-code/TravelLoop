import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Map, Globe2, TrendingUp, BarChart3, Eye, Calendar } from 'lucide-react';

const COLORS = ['#c9a84c', '#2d8a7a', '#e05c4b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    (async () => {
      try { const { data } = await axios.get('/users/admin/stats'); setStats(data); }
      catch { /* no admin stats endpoint may exist */ setStats({ totalUsers: 0, totalTrips: 0, topCities: [], recentUsers: [] }); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <div className="page"><div className="skeleton" style={{ height:200, borderRadius:'var(--radius-md)' }} /></div>;

  const topCities = stats?.topCities || [];
  const maxCityCount = Math.max(1, ...topCities.map(c => c.count || 1));

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Admin Panel</h1><p className="page-subtitle">Platform analytics & management</p></div>
      </div>

      {/* Toolbar - Matching Screen 12 Wireframe */}
      <div className="toolbar animate-fade">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search data..." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Group by</button>
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-outline btn-sm">Sort by...</button>
        </div>
      </div>

      {/* Horizontal Nav Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
        {['Manage Users', 'Popular cities', 'Popular Activities', 'User Trends and Analytics'].map((tab, i) => (
          <button key={tab} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-outline'}`} style={{ border: '2px solid var(--text-primary)' }}>{tab}</button>
        ))}
      </div>

      {/* Chart Section - Matching Screen 12 Wireframe */}
      <div className="card" style={{ padding: 24, border: '2px solid var(--text-primary)', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 32 }}>
        <div className="grid-2" style={{ gap: 40 }}>
          {/* Left: Donut and Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {[1,2,3,4].map(i => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 4 }} />
                 </div>
               ))}
            </div>
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${COLORS[0]} 0% 40%, ${COLORS[1]} 40% 70%, ${COLORS[2]} 70% 100%)`, border: '16px solid #f8fafc', outline: '1px solid #e2e8f0', flexShrink: 0 }} />
          </div>

          {/* Right: Line Chart */}
          <div style={{ position: 'relative', borderLeft: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 200 }}>
             <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute' }}>
                <polyline points="10,120 50,80 100,100 150,40 200,60 250,20" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {[10, 50, 100, 150, 200, 250].map((x, i) => {
                  const y = [120, 80, 100, 40, 60, 20][i];
                  return <circle key={i} cx={x} cy={y} r="4" fill="#2563eb" />;
                })}
             </svg>
          </div>
        </div>

        {/* Bottom: Bar Charts */}
        <div className="grid-2" style={{ gap: 40, alignItems: 'end' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'end', height: 100, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
             {[40, 90, 60, 80, 50].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: '#fbbf24', borderRadius: '4px 4px 0 0' }} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {[1,2,3,4].map(i => <div key={i} style={{ height: 8, background: i === 1 ? '#94a3b8' : '#e2e8f0', width: `${100 - i*15}%`, borderRadius: 4 }} />)}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="card-static" style={{ overflow:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem' }}>Recent Users</h3>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', minWidth:500 }}>
          <thead>
            <tr style={{ background:'var(--cream)' }}>
              <th style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'var(--text-secondary)' }}>User</th>
              <th style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'var(--text-secondary)' }}>Email</th>
              <th style={{ padding:'10px 16px', textAlign:'center', fontWeight:600, color:'var(--text-secondary)' }}>Role</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentUsers || []).map((u, i) => (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
                  <div className="sidebar-user-avatar" style={{ width:30, height:30, fontSize:'0.65rem' }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                  {u.firstName} {u.lastName}
                </td>
                <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding:'10px 16px', textAlign:'center' }}><span className={`badge ${u.role === 'admin' ? 'status-ongoing' : 'status-planning'}`}>{u.role}</span></td>
                <td style={{ padding:'10px 16px', textAlign:'right', color:'var(--text-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
