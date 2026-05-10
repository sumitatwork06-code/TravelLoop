import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit3, Trash2, Save, X, FileText, Clock, Search } from 'lucide-react';

export default function TripNotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newStop, setNewStop] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    (async () => {
      try { const { data } = await axios.get(`/trips/${id}`); setTrip(data.trip); setNotes(data.trip.notes || []); }
      catch { navigate('/my-trips'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const saveNotes = async (updated) => {
    try { await axios.put(`/trips/${id}`, { notes: JSON.stringify(updated) }); setNotes(updated); }
    catch { toast.error('Save failed'); }
  };

  const addNote = () => {
    if (!newNote.trim()) return toast.error('Write something!');
    const updated = [{ content: newNote.trim(), stop: newStop || '', createdAt: new Date().toISOString() }, ...notes];
    saveNotes(updated);
    setNewNote('');
    setNewStop('');
    toast.success('Note added!');
  };

  const deleteNote = (idx) => {
    if (!window.confirm('Delete this note?')) return;
    const updated = notes.filter((_, i) => i !== idx);
    saveNotes(updated);
    toast.success('Note deleted');
  };

  const startEdit = (idx) => { setEditIdx(idx); setEditContent(notes[idx].content); };
  const cancelEdit = () => { setEditIdx(null); setEditContent(''); };
  const saveEdit = () => {
    if (!editContent.trim()) return;
    const updated = [...notes];
    updated[editIdx] = { ...updated[editIdx], content: editContent.trim() };
    saveNotes(updated);
    setEditIdx(null);
    toast.success('Note updated!');
  };

  if (loading) return <div className="page"><div className="skeleton" style={{ height:200, borderRadius:'var(--radius-md)' }} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div>
            <h1 className="page-title">Trip Notes</h1>
            <p className="page-subtitle">{trip?.title}</p>
          </div>
        </div>
      </div>

      {/* Toolbar - Matching Screen 13 Wireframe */}
      <div className="toolbar animate-fade">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search notes..." />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Group by</button>
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-outline btn-sm">Sort by...</button>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
             <select className="card" style={{ padding: '8px 16px', border: '2px solid var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, width: 'auto' }}>
                <option>Trip: {trip?.title}</option>
             </select>
             <button onClick={() => navigate(`/trips/${id}/itinerary`)} className="btn btn-outline btn-sm" style={{ border: '2px solid var(--text-primary)' }}>+ Add Note</button>
           </div>
           <div style={{ display: 'flex', gap: 8 }}>
             {['All', 'by Day', 'by stop'].map((tab, i) => (
               <button key={tab} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-outline'}`} style={{ border: '2px solid var(--text-primary)' }}>{tab}</button>
             ))}
           </div>
        </div>
      </div>

      {/* Add Note */}
      <div className="card-static" style={{ padding:20, marginBottom:24, border: '2px solid var(--text-primary)' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', marginBottom:12 }}>New Note</h3>
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Hotel check-in info, local contacts, reminders..." rows={3} style={{ marginBottom:12, resize:'vertical' }} />
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <select value={newStop} onChange={e => setNewStop(e.target.value)} style={{ maxWidth:200 }}>
            <option value="">General (no stop)</option>
            {(trip?.stops || []).map((s, i) => <option key={i} value={s.city}>{s.city}, {s.country}</option>)}
          </select>
          <button onClick={addNote} className="btn btn-sm btn-primary" style={{ marginLeft:'auto' }}><Plus size={14} /> Add Note</button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No notes yet</h3><p>Jot down important details, reminders, or memories</p>
        </div>
      ) : (
        <div className="grid-list">
          {notes.map((note, i) => (
            <div key={i} className="card wide-card animate-fade" style={{ padding: 20, border: '2px solid var(--text-primary)', animationDelay: `${i * 0.05}s` }}>
               <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{note.stop || 'Trip Detail'} - {trip?.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{note.content}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {note.createdAt ? format(new Date(note.createdAt), 'MMM d, yyyy') : 'Day 3: June 14 2025'}
                  </div>
               </div>
               <div style={{ display: 'flex', gap: 8, alignSelf: 'start' }}>
                 <button onClick={() => startEdit(i)} style={{ color: 'var(--text-muted)' }}><Edit3 size={18} /></button>
                 <button onClick={() => deleteNote(i)} style={{ color: 'var(--primary)' }}><Trash2 size={18} /></button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
