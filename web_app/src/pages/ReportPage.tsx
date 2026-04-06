import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Simulate scores — in production these come from Supabase via the ML microservice
const MOCK_SCORES = [
  { module: 'Tremor',      score: 28, weight: 15, status: 'normal' },
  { module: 'Finger Tap',  score: 55, weight: 15, status: 'moderate' },
  { module: 'Spiral',      score: 40, weight: 12, status: 'normal' },
  { module: 'Voice',       score: 62, weight: 18, status: 'moderate' },
  { module: 'Reaction',    score: 35, weight: 10, status: 'normal' },
  { module: 'Handwriting', score: 48, weight: 15, status: 'normal' },
  { module: 'Balance',     score: 30, weight: 8,  status: 'normal' },
  { module: 'Facial',      score: 70, weight: 7,  status: 'elevated' },
];

function compositeScore(modules: typeof MOCK_SCORES) {
  const total = modules.reduce((s, m) => s + m.weight, 0);
  return Math.round(modules.reduce((s, m) => s + (m.score * m.weight) / total, 0));
}

function RiskGauge({ score }: { score: number }) {
  const r = 80; const circ = 2 * Math.PI * r;
  const color = score < 30 ? '#22c55e' : score < 60 ? '#eab308' : '#ef4444';
  const label = score < 30 ? 'Low Risk' : score < 60 ? 'Moderate Risk' : 'High Risk';
  const desc = score < 30
    ? 'Your results are within normal parameters. Continue regular monitoring.'
    : score < 60
    ? 'Some indicators are elevated. Consult a neurologist for further evaluation.'
    : 'Multiple elevated indicators detected. Please seek professional medical assessment promptly.';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ flexShrink: 0 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#1e2030" strokeWidth="14" />
          <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
            strokeLinecap="round" transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
          <text x="100" y="94" textAnchor="middle" fill="#e8eaf0" fontSize="36" fontWeight="700" fontFamily="Inter">{score}</text>
          <text x="100" y="114" textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="Inter">Risk Score</text>
        </svg>
      </div>
      <div>
        <div className={`badge mb-8 ${score < 30 ? 'badge-green' : score < 60 ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 14, padding: '5px 14px' }}>
          {label}
        </div>
        <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, maxWidth: 340 }}>{desc}</p>
        <p style={{ fontSize: 12, color: '#4b4f6a', marginTop: 12, fontStyle: 'italic' }}>
          ⚠ This is a screening result, not a diagnosis. Always consult a licensed neurologist.
        </p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [hasData] = useState(true); // set false in production until tests are run
  const score = compositeScore(MOCK_SCORES);
  const radarData = MOCK_SCORES.map(m => ({ test: m.module, score: m.score }));
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!hasData) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Report</h1><p className="page-subtitle">Complete your assessments to generate a report.</p></div>
        <div className="page-body">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No report available</div>
            <p className="empty-desc">Complete all 7 assessments to generate your personalised neurological screening report.</p>
            <a href="/tests" className="btn btn-primary">Start Assessments →</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Assessment Report</h1>
            <p className="page-subtitle">Generated on {date}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => window.print()}>⬇ Export PDF</button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Score Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card card-p">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4b4f6a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20 }}>Composite Risk Score</div>
          <RiskGauge score={score} />
        </motion.div>

        {/* Charts row */}
        <div className="grid-2" style={{ gap: 20 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card card-p">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Module Overview</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 4, right: 12, bottom: 4, left: 12 }}>
                <PolarGrid stroke="#1e2030" />
                <PolarAngleAxis dataKey="test" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="card card-p">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Score by Module</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_SCORES} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis type="category" dataKey="module" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#13151f', border: '1px solid #2d2f3e', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Module breakdown table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
          <div style={{ padding: '20px 24px 12px', fontSize: 14, fontWeight: 600 }}>Detailed Findings</div>
          <table className="hist-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Score</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SCORES.map(m => (
                <tr key={m.module}>
                  <td style={{ fontWeight: 500, color: '#e8eaf0' }}>{m.module}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-track" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${m.score}%`, background: m.score < 40 ? '#22c55e' : m.score < 65 ? '#eab308' : '#ef4444' }} />
                      </div>
                      <span style={{ fontSize: 13, color: '#e8eaf0', fontWeight: 600 }}>{m.score}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{m.weight}%</td>
                  <td>
                    <span className={`badge ${m.status === 'normal' ? 'badge-green' : m.status === 'moderate' ? 'badge-yellow' : 'badge-red'}`}>
                      {m.status === 'normal' ? 'Normal' : m.status === 'moderate' ? 'Moderate' : 'Elevated'}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>
                    {m.status === 'normal' ? 'Within expected parameters' : m.status === 'moderate' ? 'Slightly outside normal range' : 'Significantly elevated — review recommended'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Clinical note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 8 }}>Clinical Disclaimer</div>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
            NeuroCheck is a digital screening tool based on clinically-researched biomarkers. It is not a medical device and cannot diagnose Parkinson's disease or any other condition. Results should be discussed with a qualified neurologist. Early-stage Parkinson's can only be definitively diagnosed through clinical examination, imaging, and specialist assessment.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
