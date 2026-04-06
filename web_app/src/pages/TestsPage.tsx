import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TremorTest from '../components/tests/TremorTest';
import FingerTapTest from '../components/tests/FingerTapTest';
import SpiralTest from '../components/tests/SpiralTest';
import VoiceTest from '../components/tests/VoiceTest';
import ReactionTest from '../components/tests/ReactionTest';
import HandwritingTest from '../components/tests/HandwritingTest';
import BalanceTest from '../components/tests/BalanceTest';
import FacialTest from '../components/tests/FacialTest';

const TESTS = [
  {
    id: 'tremor', label: 'Tremor Analysis', desc: 'Measures involuntary hand tremors using accelerometer data at 60Hz over 30 seconds.',
    icon: '📳', color: '#6366f1', sensor: 'Motion Sensor', duration: '30s',
  },
  {
    id: 'tap', label: 'Finger Tap Test', desc: 'Evaluates finger dexterity and bradykinesia by measuring alternating tap speed.',
    icon: '👆', color: '#14b8a6', sensor: 'Touch Input', duration: '20s',
  },
  {
    id: 'spiral', label: 'Spiral Drawing', desc: 'Assesses motor control and tremor by tracing a guided spiral with your mouse.',
    icon: '🌀', color: '#8b5cf6', sensor: 'Mouse / Stylus', duration: '60s',
  },
  {
    id: 'voice', label: 'Voice Analysis', desc: 'Records sustained phonation and analyses acoustic biomarkers including jitter and shimmer.',
    icon: '🎙️', color: '#ec4899', sensor: 'Microphone', duration: '5s',
  },
  {
    id: 'reaction', label: 'Reaction Time', desc: 'Measures neurological response speed via 5 randomised visual stimulus trials.',
    icon: '⚡', color: '#eab308', sensor: 'Click / Touch', duration: '~60s',
  },
  {
    id: 'handwriting', label: 'Handwriting Test', desc: 'Evaluates letter formation consistency and pressure patterns indicative of micrographia.',
    icon: '✍️', color: '#06b6d4', sensor: 'Mouse / Stylus', duration: '90s',
  },
  {
    id: 'balance', label: 'Balance Assessment', desc: 'Measures postural stability using the device gyroscope. Hold the device still while standing.',
    icon: '⚖️', color: '#a855f7', sensor: 'Gyroscope', duration: '30s',
  },
  {
    id: 'facial', label: 'Facial Expression', desc: 'Detects facial masking — a hallmark Parkinson\'s symptom — by capturing 5 prompted expressions.',
    icon: '🙂', color: '#f97316', sensor: 'Camera', duration: '2 min',
  },
];

const MODALS: Record<string, React.FC<{ onClose: () => void }>> = {
  tremor: TremorTest, tap: FingerTapTest, spiral: SpiralTest, voice: VoiceTest,
  reaction: ReactionTest, handwriting: HandwritingTest, balance: BalanceTest, facial: FacialTest,
};

export default function TestsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const Modal = active ? MODALS[active] : null;
  const pct = Math.round((done.size / TESTS.length) * 100);

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Assessments</h1>
            <p className="page-subtitle">{done.size} of {TESTS.length} tests completed</p>
          </div>
          {done.size === TESTS.length && (
            <a href="/report" className="btn btn-primary">View Full Report →</a>
          )}
        </div>
        <div className="progress-track mt-16" style={{ marginTop: 20 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: done.size === TESTS.length ? '#22c55e' : '#6366f1' }} />
        </div>
      </div>

      <div className="page-body">
        <div className="test-grid">
          {TESTS.map((t, i) => {
            const isDone = done.has(t.id);
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`test-card ${isDone ? 'done' : ''}`} onClick={() => setActive(t.id)}>
                <div className="test-card-icon" style={{ background: `${t.color}18` }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="test-card-title" style={{ marginBottom: 0 }}>{t.label}</h3>
                  {isDone
                    ? <span className="badge badge-green">Done</span>
                    : <span className="badge badge-gray">{t.duration}</span>
                  }
                </div>
                <p className="test-card-desc">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 11.5, color: '#4b4f6a' }}>📡 {t.sensor}</span>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>
                    {isDone ? 'Retake' : 'Start →'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {done.size === TESTS.length && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card card-p" style={{ marginTop: 24, textAlign: 'center', borderColor: 'rgba(34,197,94,0.3)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>All assessments complete!</h3>
            <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 20 }}>Your data has been analysed. View your full risk report now.</p>
            <a href="/report" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>View Full Report →</a>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {Modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Modal onClose={() => {
                if (active) setDone(d => new Set([...d, active]));
                setActive(null);
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
