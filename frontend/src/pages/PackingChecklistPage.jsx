import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Check, RotateCcw, ChevronDown, ChevronRight, Package } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { category: 'Clothing', items: ['T-shirts', 'Pants/Shorts', 'Underwear', 'Socks', 'Jacket', 'Pajamas'] },
  { category: 'Toiletries', items: ['Toothbrush', 'Toothpaste', 'Shampoo', 'Sunscreen', 'Deodorant'] },
  { category: 'Documents', items: ['Passport', 'ID Card', 'Travel Insurance', 'Booking Confirmations', 'Visa'] },
  { category: 'Electronics', items: ['Phone Charger', 'Power Bank', 'Headphones', 'Camera', 'Travel Adapter'] },
  { category: 'Essentials', items: ['Medications', 'First Aid Kit', 'Water Bottle', 'Snacks', 'Cash'] },
];

export default function PackingChecklistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packingList, setPackingList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/trips/${id}`);
        setTrip(data.trip);
        setPackingList(data.trip.packingList?.length > 0 ? data.trip.packingList : DEFAULT_CATEGORIES.map(c => ({ category: c.category, items: c.items.map(name => ({ name, packed: false })) })));
      } catch { navigate('/my-trips'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const save = async (list) => {
    setSaving(true);
    try { await axios.put(`/trips/${id}`, { packingList: JSON.stringify(list) }); toast.success('Saved!'); }
    catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const toggleItem = (catIdx, itemIdx) => {
    const updated = [...packingList];
    updated[catIdx].items[itemIdx].packed = !updated[catIdx].items[itemIdx].packed;
    setPackingList(updated);
    save(updated);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...packingList];
    const catIdx = updated.findIndex(c => c.category === newCategory);
    if (catIdx >= 0) { updated[catIdx].items.push({ name: newItem.trim(), packed: false }); }
    else { updated.push({ category: newCategory, items: [{ name: newItem.trim(), packed: false }] }); }
    setPackingList(updated);
    setNewItem('');
    save(updated);
  };

  const removeItem = (catIdx, itemIdx) => {
    const updated = [...packingList];
    updated[catIdx].items.splice(itemIdx, 1);
    if (updated[catIdx].items.length === 0) updated.splice(catIdx, 1);
    setPackingList(updated);
    save(updated);
  };

  const resetAll = () => {
    if (!window.confirm('Unpack all items? This will mark everything as not packed.')) return;
    const updated = packingList.map(cat => ({ ...cat, items: cat.items.map(i => ({ ...i, packed: false })) }));
    setPackingList(updated);
    save(updated);
    toast.success('Checklist reset!');
  };

  const totalItems = packingList.reduce((s, c) => s + c.items.length, 0);
  const packedItems = packingList.reduce((s, c) => s + c.items.filter(i => i.packed).length, 0);
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  const allCategories = [...new Set(packingList.map(c => c.category)), 'General'];

  if (loading) return <div className="page"><div className="skeleton" style={{ height:200, borderRadius:'var(--radius-md)' }} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div><h1 className="page-title">Packing Checklist</h1><p className="page-subtitle">{trip?.title}</p></div>
        </div>
        <button onClick={resetAll} className="btn btn-sm btn-outline"><RotateCcw size={14} /> Reset All</button>
      </div>

      {/* Progress Header - Screen 17 */}
      <div className="card-static" style={{ 
        padding: 32, 
        borderRadius: 24, 
        marginBottom: 32, 
        background: 'var(--ink)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 32
      }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>{progress}%</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Packing Status</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>You've packed {packedItems} out of {totalItems} items. Almost ready for takeoff!</p>
        </div>
        <button onClick={resetAll} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', gap: 8 }}><RotateCcw size={16} /> Reset</button>
      </div>

      {/* Add Item Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 32, 
        background: 'white', 
        padding: 12, 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: 140, border: 'none', background: 'var(--surface)', borderRadius: 10, fontWeight: 700 }}>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="What else do you need?" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} style={{ flex: 1, border: 'none', padding: '0 12px', fontSize: '1rem' }} />
        <button onClick={addItem} className="btn btn-primary" style={{ borderRadius: 10, padding: '0 24px' }}>Add Item</button>
      </div>

      {/* Categories */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {packingList.map((cat, ci) => {
          const catPacked = cat.items.filter(i => i.packed).length;
          const isCollapsed = collapsed[cat.category];
          return (
            <div key={ci} className="card-static" style={{ overflow:'hidden' }}>
              <button onClick={() => setCollapsed({ ...collapsed, [cat.category]: !isCollapsed })} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background: catPacked === cat.items.length && cat.items.length > 0 ? 'rgba(45,138,122,0.05)' : 'transparent', cursor:'pointer', border:'none', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700 }}>{cat.category}</h3>
                  <span className="badge" style={{ background:'var(--cream)', color:'var(--text-muted)' }}>{catPacked}/{cat.items.length}</span>
                </div>
                {catPacked === cat.items.length && cat.items.length > 0 && <Check size={16} color="var(--teal)" />}
              </button>
              {!isCollapsed && (
                <div style={{ padding:'0 20px 16px' }}>
                  {cat.items.map((item, ii) => (
                    <div key={ii} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: ii < cat.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <button onClick={() => toggleItem(ci, ii)} style={{ width:22, height:22, borderRadius:6, border: item.packed ? 'none' : '2px solid var(--border-dark)', background: item.packed ? 'var(--teal)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
                        {item.packed && <Check size={14} color="white" />}
                      </button>
                      <span style={{ flex:1, fontSize:'0.9rem', textDecoration: item.packed ? 'line-through' : 'none', color: item.packed ? 'var(--text-muted)' : 'var(--text-primary)', transition:'all 0.2s' }}>{item.name}</span>
                      <button onClick={() => removeItem(ci, ii)} style={{ color:'var(--text-muted)', cursor:'pointer', opacity:0.5, transition:'all 0.2s' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
