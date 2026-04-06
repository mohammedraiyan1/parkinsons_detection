import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

function ScoreGauge({ score }: { score: number }) {
  const r = 72; const circ = 2 * Math.PI * r;
  const color = score < 30 ? '#22c55e' : score < 60 ? '#eab308' : '#ef4444';
  const label = score === 0 ? 'No data' : score < 30 ? 'Low Risk' : score < 60 ? 'Moderate' : 'High Risk';
  const badgeClass = score < 30 ? 'badge-green' : score < 60 ? 'badge-yellow' : 'badge-red';

  return (
    <div className="gauge-container">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1e2030" strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(score, 100) / 100)}
          strokeLinecap="round" transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x="90" y="86" textAnchor="middle" fill="#e8eaf0" fontSize="28" fontWeight="700" fontFamily="Inter">{score}</text>
        <text x="90" y="104" textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="Inter">/ 100</text>
      </svg>
      <span className={`badge ${badgeClass}`} style={{ marginTop: 8 }}>{label}</span>
    </div>
  );
}

const RADAR_KEYS = ['Tremor', 'Tap', 'Spiral', 'Voice', 'Reaction', 'Handwriting', 'Balance', 'Facial'];

export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const firstName = user?.user_metadata?.first_name || 'there';
  const score = 0;

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const radarData = RADAR_KEYS.map(k => ({ test: k, score: 0 }));

  return (
    <div>
      <div className="page-header">
        <p className="text-sm text-muted mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <motion.h1 className="page-title" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {greeting}, {firstName}.
        </motion.h1>
        <p className="page-subtitle">Here's your neurological health overview.</p>
      </div>

      <div className="page-body">
        {/* Stats row */}
        <div className="grid-4 mb-24" style={{ marginBottom: 20 }}>
          {[
            { label: 'Tests Done', value: '0 / 7', color: '#6366f1' },
            { label: 'Risk Score', value: `${score}`, color: '#e8eaf0' },
            { label: 'Sessions', value: '0', color: '#e8eaf0' },
            { label: 'Last Test', value: '—', color: '#e8eaf0' },
          ].map(({ label, value, color }, i) => (
            <motion.div key={label} className="card stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color, fontSize: 26 }}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Main row */}
        <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
          {/* Gauge */}
          <motion.div className="card card-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, justifyContent: 'center', minHeight: 300 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Composite Risk Score</div>
            <ScoreGauge score={score} />
            {score === 0 && <p className="text-xs text-muted" style={{ textAlign: 'center', maxWidth: 200 }}>Complete assessments to see your personalised score.</p>}
            <Link to="/tests" className="btn btn-primary btn-sm">Start Assessment →</Link>
          </motion.div>

          {/* Radar */}
          <motion.div className="card card-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Module Breakdown</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <PolarGrid stroke="#1e2030" />
                <PolarAngleAxis dataKey="test" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 8 }}>Complete tests to populate this chart.</p>
          </motion.div>
        </div>

        {/* Quick links */}
        <motion.div className="card card-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Quick Actions</div>
          <div className="flex gap-12">
            <Link to="/tests" className="btn btn-primary">Run Assessments</Link>
            <Link to="/report" className="btn btn-secondary">View Report</Link>
            <Link to="/history" className="btn btn-secondary">History</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
