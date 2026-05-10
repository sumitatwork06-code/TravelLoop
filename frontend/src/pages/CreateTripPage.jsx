import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Calendar, Plus, X, Upload } from 'lucide-react';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    totalBudget: '', currency: 'USD', visibility: 'public',
    travelStyle: 'mid-range', season: 'any', tags: [],
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput('');
    }
  };
  const removeTag = (tag) => setForm({ ...form, tags: form.tags.filter(t => t !== tag) });

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.endDate) return toast.error('Title and dates are required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'tags' ? JSON.stringify(v) : v));
      if (coverFile) fd.append('coverImage', coverFile);
      const { data } = await axios.post('/trips', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Trip created! 🎉');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 40, maxWidth: 720, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 24, gap: 6 }}><ArrowLeft size={16} /> Back</button>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Plan a New Trip</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Fill in the details to start your adventure</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--gold)' : 'var(--border)', transition: 'all 0.3s' }} />)}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group"><label className="form-label">Trip Title *</label><input placeholder="e.g. Summer in Italy" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea placeholder="What's this trip about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">End Date *</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} min={form.startDate} /></div>
          </div>
          <button onClick={() => { if (!form.title || !form.startDate || !form.endDate) return toast.error('Fill required fields'); setStep(2); }} className="btn btn-primary btn-full" style={{ padding: 14 }}>Continue <ArrowRight size={16} /></button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group"><label className="form-label">Cover Image</label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)', cursor: 'pointer', overflow: 'hidden', background: 'var(--cream)' }}>
              {coverPreview ? <img src={coverPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><Upload size={32} color="var(--text-muted)" /><span style={{ color: 'var(--text-muted)', marginTop: 8 }}>Click to upload</span></>}
              <input type="file" accept="image/*" onChange={handleCover} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">Budget</label><input type="number" placeholder="0" value={form.totalBudget} onChange={e => setForm({ ...form, totalBudget: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Currency</label><select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>{['USD','EUR','GBP','INR','JPY'].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">Travel Style</label><select value={form.travelStyle} onChange={e => setForm({ ...form, travelStyle: e.target.value })}>{['budget','backpacker','mid-range','luxury','family'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Season</label><select value={form.season} onChange={e => setForm({ ...form, season: e.target.value })}>{['any','spring','summer','autumn','winter'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button><button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2, padding: 14 }}>Continue <ArrowRight size={16} /></button></div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group"><label className="form-label">Visibility</label>
            <div style={{ display: 'flex', gap: 12 }}>{['public','private','friends'].map(v => <button key={v} onClick={() => setForm({ ...form, visibility: v })} className={`btn btn-sm ${form.visibility === v ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize', flex: 1 }}>{v}</button>)}</div>
          </div>
          <div className="form-group"><label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: 8 }}><input placeholder="Add a tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} /><button onClick={addTag} className="btn btn-outline btn-sm"><Plus size={14} /></button></div>
            {form.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{form.tags.map(tag => <span key={tag} className="tag" style={{ gap: 6 }}>{tag} <button onClick={() => removeTag(tag)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button></span>)}</div>}
          </div>
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 20, border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>PREVIEW</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{form.title || 'Untitled Trip'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{form.startDate} → {form.endDate} · {form.totalBudget || '0'} {form.currency}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-gold" style={{ flex: 2, padding: 14 }}>{loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : 'Create Trip 🚀'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
