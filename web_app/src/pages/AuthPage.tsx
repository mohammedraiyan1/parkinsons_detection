import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BackgroundMedia from '../components/BackgroundMedia';
import BrainModel from '../components/BrainModel';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', dob: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }
        const { data, error: err } = await signUp(form.email, form.password, { 
          first_name: form.firstName, 
          last_name: form.lastName, 
          dob: form.dob 
        });
        if (err) throw err;
        if (data?.session) navigate('/dashboard');
        else { setSuccess('Account created! Check your email to confirm, then sign in.'); setMode('login'); }
      } else {
        const { error: err } = await signIn(form.email, form.password);
        if (err) {
          if (err.message?.toLowerCase().includes('email not confirmed'))
            setError('Please confirm your email first. Check your inbox.');
          else throw err;
          return;
        }
        navigate('/dashboard');
      }
    } catch (e: any) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <BackgroundMedia />
      <BrainModel />
      
      <div className="auth-container">
        <motion.div 
          className="auth-glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 14, 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 24, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)' 
            }}>🧠</div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.8px', color: '#fff' }}>NeuroCheck</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8, color: '#fff' }}>
              {mode === 'login' ? 'Welcome back' : 'Empower Your Health'}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}>
              {mode === 'login' ? 'Sign in to access your AI diagnostics.' : 'Join the frontier of Parkinson\'s screening.'}
            </p>
          </div>

          <div className="auth-tabs" style={{ marginBottom: 32 }}>
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
          </div>

          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="auth-alert auth-alert-error">{error}</motion.div>}
          {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="auth-alert auth-alert-success">{success}</motion.div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" name="firstName" placeholder="John" value={form.firstName} onChange={handle} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" name="lastName" placeholder="Doe" value={form.lastName} onChange={handle} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" name="dob" type="date" value={form.dob} onChange={handle} required />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group" style={{ marginBottom: mode === 'register' ? 20 : 32 }}>
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            {mode === 'register' && (
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handle} required />
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary btn-full btn-lg" 
              disabled={loading} 
              style={{ opacity: loading ? 0.65 : 1, fontWeight: 700, fontSize: 16 }}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
