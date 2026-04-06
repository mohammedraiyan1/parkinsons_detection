import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const meta = user?.user_metadata || {};
  const name = `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const dob = meta.dob ? new Date(meta.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account information.</p>
      </div>
      <div className="page-body" style={{ maxWidth: 640 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card card-p" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-20" style={{ gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e8eaf0', marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13.5, color: '#6b7280' }}>{user?.email}</div>
              <div className="badge badge-blue" style={{ marginTop: 8 }}>Patient Account</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card">
          <div style={{ padding: '20px 24px 12px', fontSize: 13, fontWeight: 600, color: '#4b4f6a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Details</div>
          {[
            ['Full Name', name],
            ['Email Address', user?.email || '—'],
            ['Date of Birth', dob],
            ['Account Created', joined],
            ['User ID', user?.id?.slice(0, 18) + '...' || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #1e2030' }}>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: 13.5, color: '#e8eaf0', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '16px 20px', marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>Data & Privacy</div>
          <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.7 }}>
            Your health data is stored securely and never sold or shared with third parties. All sensor recordings are processed and discarded — only anonymised scores are retained.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
