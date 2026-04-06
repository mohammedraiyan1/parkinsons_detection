import React, { useState, useEffect, useRef } from 'react';

interface Props { onClose: () => void; }

export default function BalanceTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'recording' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [sway, setSway] = useState({ x: 0, y: 0 });
  const [maxSway, setMaxSway] = useState(0);
  const dataRef = useRef<any[]>([]);
  const intervalRef = useRef<any>(null);

  const start = () => {
    if (!('DeviceMotionEvent' in window)) { alert('Motion sensor not available. Try on mobile.'); return; }
    setPhase('recording');
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      setSway({ x: +(a.x || 0).toFixed(2), y: +(a.y || 0).toFixed(2) });
      const mag = Math.sqrt((a.x||0)**2 + (a.y||0)**2 + (a.z||0)**2);
      setMaxSway(m => Math.max(m, mag));
      dataRef.current.push({ x: a.x, y: a.y, z: a.z, t: Date.now() });
    };
    window.addEventListener('devicemotion', handler);
    let t = 30;
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
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>⚖️ Balance Test</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase === 'intro' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>Place the phone in your pocket, stand straight with feet together, close your eyes and remain as still as possible for 30 seconds.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={start}>⚖️ Start Balance Test</button>
        </>
      )}
      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid #a855f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(168,85,247,0.25)' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#a855f7' }}>{timeLeft}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>seconds</div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Stand still...</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>X-axis</div><div style={{ color: '#a855f7', fontWeight: 700 }}>{sway.x}</div></div>
            <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Y-axis</div><div style={{ color: '#a855f7', fontWeight: 700 }}>{sway.y}</div></div>
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Test Complete!</h3>
          <p style={{ color: '#a855f7', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Max sway: {maxSway.toFixed(2)} m/s²</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Samples captured: {dataRef.current.length}</p>
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
