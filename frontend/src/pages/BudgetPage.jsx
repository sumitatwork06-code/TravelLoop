import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, DollarSign, AlertTriangle, TrendingUp, PieChart, Plus } from 'lucide-react';

const COLORS = ['#c9a84c', '#2d8a7a', '#e05c4b', '#8b5cf6', '#ec4899', '#6366f1', '#f59e0b'];

export default function BudgetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await axios.get(`/trips/${id}`); setTrip(data.trip); }
      catch { navigate('/my-trips'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="page"><div className="skeleton" style={{ height:300, borderRadius:'var(--radius-md)' }} /></div>;
  if (!trip) return null;

  const { user } = useAuth();
  const isOwner = user?._id === (trip.author?._id || trip.author);

  const stops = trip.stops || [];
  const totalBudget = trip.totalBudget || 0;
  const days = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000));

  // Calculate costs
  let transportTotal = 0, accommodationTotal = 0, activityTotal = 0, foodTotal = 0;
  const perStop = stops.map(s => {
    const transport = s.transportCost || 0;
    const accommodation = s.accommodation?.cost || 0;
    const food = s.foodCost || 0;
    const activities = (s.activities || []).reduce((sum, a) => sum + (a.cost || 0), 0);
    transportTotal += transport;
    accommodationTotal += accommodation;
    foodTotal += food;
    activityTotal += activities;
    return { city: s.city, transport, accommodation, food, activities, total: transport + accommodation + food + activities };
  });

  const totalSpent = transportTotal + accommodationTotal + foodTotal + activityTotal;
  const remaining = totalBudget - totalSpent;
  const avgPerDay = (totalSpent / days).toFixed(0);
  const overBudget = remaining < 0;

  // Category breakdown for donut
  const categories = [
    { label: 'Transport', value: transportTotal, color: COLORS[0] },
    { label: 'Accommodation', value: accommodationTotal, color: COLORS[1] },
    { label: 'Food', value: foodTotal, color: COLORS[3] },
    { label: 'Activities', value: activityTotal, color: COLORS[2] },
  ].filter(c => c.value > 0);

  // CSS conic gradient for donut
  let conicParts = [], offset = 0;
  categories.forEach(c => {
    const pct = totalSpent > 0 ? (c.value / totalSpent) * 100 : 0;
    conicParts.push(`${c.color} ${offset}% ${offset + pct}%`);
    offset += pct;
  });
  const conicGradient = conicParts.length > 0 ? `conic-gradient(${conicParts.join(', ')})` : 'conic-gradient(var(--border) 0% 100%)';

  // Daily breakdown for bar chart
  const maxStopCost = Math.max(1, ...perStop.map(s => s.total));
  const dailyBudget = totalBudget / days;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div><h1 className="page-title">Budget & Costs</h1><p className="page-subtitle">{trip.title}</p></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom:32 }}>
        <div className="card-static" style={{ padding:20 }}>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:4 }}>Total Budget</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700 }}>₹{totalBudget.toLocaleString()}</div>
        </div>
        <div className="card-static" style={{ padding:20 }}>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:4 }}>Estimated Cost</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color: overBudget ? 'var(--coral)' : 'var(--teal)' }}>₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="card-static" style={{ padding:20 }}>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:4 }}>Remaining</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color: overBudget ? 'var(--coral)' : 'var(--teal)' }}>
            {overBudget && <AlertTriangle size={18} style={{ display:'inline', marginRight:4 }} />}
            ₹{Math.abs(remaining).toLocaleString()}{overBudget ? ' over' : ''}
          </div>
        </div>
        <div className="card-static" style={{ padding:20 }}>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:4 }}>Avg / Day</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700 }}>₹{avgPerDay}</div>
        </div>
      </div>

      {/* Over budget alert */}
      {overBudget && (
        <div style={{ padding:'14px 20px', background:'rgba(224,92,75,0.08)', border:'1px solid rgba(224,92,75,0.2)', borderRadius:'var(--radius-sm)', marginBottom:24, display:'flex', alignItems:'center', gap:10, color:'var(--coral)', fontSize:'0.9rem' }}>
          <AlertTriangle size={18} /> You are <strong>₹{Math.abs(remaining).toLocaleString()}</strong> over budget! Consider reducing costs.
        </div>
      )}

      {/* Main Budget Visual - Screen 14 */}
      <div className="card-static" style={{ padding: 40, borderRadius: 32, marginBottom: 40, background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Chart Side */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: conicGradient, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: 220, 
                height: 220, 
                borderRadius: '50%', 
                background: 'white', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total Budget</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800 }}>₹{totalBudget.toLocaleString()}</div>
                <div style={{ 
                  marginTop: 12, 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  background: overBudget ? 'var(--coral-light)' : 'var(--teal-light)',
                  color: overBudget ? 'var(--coral)' : 'var(--teal)',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  {overBudget ? 'Over Budget' : 'On Track'}
                </div>
              </div>
            </div>
          </div>

          {/* List Side */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Spending Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {categories.map(c => (
                <div key={c.label} className="card-static" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}20`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.label === 'Transport' ? <TrendingUp size={20} /> : c.label === 'Accommodation' ? <PieChart size={20} /> : <DollarSign size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{c.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{totalSpent > 0 ? Math.round(c.value/totalSpent*100) : 0}% of total spend</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{c.value.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(c.value / (totalBudget/100))}% of budget</div>
                  </div>
                </div>
              ))}
              
              {remaining > 0 && (
                <div className="card-static" style={{ padding: '16px 20px', border: '1px dashed var(--border)', borderRadius: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Remaining</div>
                     <div style={{ fontWeight: 800, color: 'var(--teal)' }}>₹{remaining.toLocaleString()}</div>
                   </div>
                </div>
              )}
            </div>
            
            {isOwner && (
              <button onClick={() => toast.success('Expense tracking feature coming soon!')} className="btn btn-primary" style={{ width: '100%', marginTop: 24, height: 50, borderRadius: 12, fontSize: '1rem', gap: 8 }}>
                <Plus size={18} /> Add New Record
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card-static" style={{ overflow:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem' }}>Detailed Breakdown</h3>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
          <thead>
            <tr style={{ background:'var(--cream)' }}>
              <th style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, color:'var(--text-secondary)' }}>Stop</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Transport</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Stay</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Food</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--text-secondary)' }}>Activities</th>
              <th style={{ padding:'10px 16px', textAlign:'right', fontWeight:700 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {perStop.map((s, i) => (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 16px', fontWeight:600 }}>{s.city}</td>
                <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{s.transport}</td>
                <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{s.accommodation}</td>
                <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{s.food}</td>
                <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{s.activities}</td>
                <td style={{ padding:'10px 16px', textAlign:'right', fontWeight:700, color: s.total > dailyBudget*3 ? 'var(--coral)' : 'var(--text-primary)' }}>₹{s.total}</td>
              </tr>
            ))}
            <tr style={{ background:'var(--cream)', fontWeight:700 }}>
              <td style={{ padding:'10px 16px' }}>Total</td>
              <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{transportTotal}</td>
              <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{accommodationTotal}</td>
              <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{foodTotal}</td>
              <td style={{ padding:'10px 16px', textAlign:'right' }}>₹{activityTotal}</td>
              <td style={{ padding:'10px 16px', textAlign:'right', color: overBudget ? 'var(--coral)' : 'var(--teal)' }}>₹{totalSpent}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
