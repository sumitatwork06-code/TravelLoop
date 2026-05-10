import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Compass, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Enter your email');
        setLoading(true);
        try {
            await axios.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.5s ease' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Compass size={20} color="var(--gold)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 700 }}>Traveloop</span>
                </div>

                <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 40 }}>
                    {!sent ? (
                        <>
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <Mail size={26} color="var(--gold-dark)" />
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Reset Password</h2>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 36 }} />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '14px' }}>
                                    {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(201,168,76,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <><Send size={16} /> Send Reset Link</>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(45,138,122,0.1)', border: '2px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Mail size={32} color="var(--teal)" />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Check your inbox</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <button onClick={() => setSent(false)} className="btn btn-outline btn-full">Send again</button>
                        </div>
                    )}

                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 24, justifyContent: 'center' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}