import React, { useState, useEffect, useRef } from 'react';

interface Props { onClose: () => void; }

export default function TremorTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'recording' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [data, setData] = useState<any[]>([]);
  const intervalRef = useRef<any>(null);

  const startTest = () => {
    if (!('DeviceMotionEvent' in window)) { alert('Device motion not supported on this device/browser.'); return; }
    setPhase('recording');
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (a) setData(d => [...d, { x: a.x, y: a.y, z: a.z, t: Date.now() }]);
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

  const magnitude = data.length > 10
    ? (data.slice(-10).reduce((s, d) => s + Math.sqrt((d.x||0)**2 + (d.y||0)**2 + (d.z||0)**2), 0) / 10).toFixed(2)
    : '—';

  return (
    <div className="modal" style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>📳 Tremor Test</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase === 'intro' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>
            Place your device on a flat surface or hold it completely still with both hands. The test will record motion data for 30 seconds to analyze hand tremors.
          </p>
          <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ color: '#fb923c', fontSize: 14 }}>⚠️ Note: This test requires a mobile device or laptop with motion sensors. Best results on mobile.</p>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={startTest}>▶ Start 30-Second Test</button>
        </>
      )}
      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid #f97316', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(249,115,22,0.3)' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#f97316' }}>{timeLeft}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>seconds</div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Recording: hold as still as possible</p>
          <p style={{ color: '#14b8a6', fontWeight: 600, marginTop: 8 }}>Samples: {data.length} | Magnitude: {magnitude}</p>
        </div>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Test Complete!</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Captured {data.length} sensor readings</p>
          <p style={{ color: '#14b8a6', marginBottom: 24 }}>Average magnitude: {magnitude} m/s²</p>
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
