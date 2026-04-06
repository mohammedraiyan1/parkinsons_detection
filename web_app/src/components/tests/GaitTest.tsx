import React, { useState, useEffect, useRef } from 'react';

interface Props { onClose: () => void; }

export default function GaitTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'recording' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(20);
  const [steps, setSteps] = useState(0);
  const dataRef = useRef<any[]>([]);
  const intervalRef = useRef<any>(null);
  const lastPeakRef = useRef(0);

  const start = () => {
    if (!('DeviceMotionEvent' in window)) { alert('Motion sensor not available. Try on mobile.'); return; }
    setPhase('recording');
    const handler = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (!a) return;
      const mag = Math.sqrt((a.x||0)**2 + (a.y||0)**2 + (a.z||0)**2);
      dataRef.current.push({ mag, t: Date.now() });
      if (mag > 2.5 && Date.now() - lastPeakRef.current > 350) {
        lastPeakRef.current = Date.now();
        setSteps(s => s + 1);
      }
    };
    window.addEventListener('devicemotion', handler);
    let t = 20;
    intervalRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(intervalRef.current);
        window.removeEventListener('devicemotion', handler);
        setPhase('done');
      }
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="modal" style={{ maxWidth: 460 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>🚶 Gait Analysis</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase === 'intro' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>Hold your phone in hand, press start, and walk normally for 20 seconds. The test will analyze your step regularity and gait pattern.</p>
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ color: '#4ade80', fontSize: 14 }}>📱 Best results: hold phone in your hand or pocket while walking naturally.</p>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={start}>🚶 Start Walking Test</button>
        </>
      )}
      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid #22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(34,197,94,0.25)' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#22c55e' }}>{timeLeft}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>seconds</div>
          </div>
          <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 20 }}>🦶 Steps detected: {steps}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Walk normally—don't look at the screen.</p>
        </div>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Test Complete!</h3>
          <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{steps} steps detected</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Cadence: ~{steps > 0 ? (steps / 20 * 60).toFixed(0) : '—'} steps/min</p>
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
