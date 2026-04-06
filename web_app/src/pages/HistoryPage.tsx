import React from 'react';
import { motion } from 'framer-motion';

const SESSIONS = [
  { date: '04 Apr 2026', score: 47, tests: 7, status: 'Moderate' },
];

export default function HistoryPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Session History</h1>
        <p className="page-subtitle">All your past neurological assessments.</p>
      </div>
      <div className="page-body">
        {SESSIONS.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No sessions yet</div>
            <p className="empty-desc">Complete your first assessment to see your history here.</p>
            <a href="/tests" className="btn btn-primary">Start Assessment →</a>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Composite Score</th>
                  <th>Tests Completed</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {SESSIONS.map((s, i) => (
                  <tr key={i}>
                    <td style={{ color: '#e8eaf0', fontWeight: 500 }}>{s.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-track" style={{ width: 100 }}>
                          <div className="progress-fill" style={{ width: `${s.score}%`, background: s.score < 30 ? '#22c55e' : s.score < 60 ? '#eab308' : '#ef4444' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#e8eaf0' }}>{s.score}</span>
                      </div>
                    </td>
                    <td style={{ color: '#9ca3af' }}>{s.tests} / 7</td>
                    <td>
                      <span className={`badge ${s.status === 'Low' ? 'badge-green' : s.status === 'Moderate' ? 'badge-yellow' : 'badge-red'}`}>{s.status}</span>
                    </td>
                    <td><a href="/report" className="btn btn-secondary btn-sm">View Report</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
