import React, { useState, useRef, useEffect } from 'react';

interface Props { onClose: () => void; }

export default function FingerTapTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'testing' | 'done'>('intro');
  const [taps, setTaps] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeBtn, setActiveBtn] = useState<'L' | 'R' | null>(null);
  const intervalRef = useRef<any>(null);

  const start = () => {
    setPhase('testing');
    setActiveBtn('L');
    let t = 20;
    intervalRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) { clearInterval(intervalRef.current); setPhase('done'); }
    }, 1000);
  };

  const tap = (side: 'L' | 'R') => {
    if (phase !== 'testing') return;
    setTaps(prev => [...prev, Date.now()]);
    setActiveBtn(side === 'L' ? 'R' : 'L');
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const avgInterval = taps.length > 2
    ? ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)).toFixed(0)
    : '—';

  return (
    <div className="modal" style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>👆 Finger Tap Test</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase === 'intro' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>Alternate tapping the LEFT and RIGHT buttons as rapidly as possible for 20 seconds. Start with the highlighted button.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={start}>▶ Start Test</button>
        </>
      )}
      {phase === 'testing' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#14b8a6' }}>{timeLeft}s</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Taps: {taps.length}&nbsp;|&nbsp;Avg: {avgInterval}ms</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {(['L', 'R'] as const).map(side => (
              <button key={side} onClick={() => tap(side)} style={{
                height: 160, borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 24,
                background: activeBtn === side ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'rgba(255,255,255,0.08)',
                color: activeBtn === side ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.1s',
                transform: activeBtn === side ? 'scale(1.04)' : 'scale(1)',
                boxShadow: activeBtn === side ? '0 0 30px rgba(20,184,166,0.5)' : 'none',
              }}>{side === 'L' ? '← Left' : 'Right →'}</button>
            ))}
          </div>
        </div>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Test Complete!</h3>
          <p style={{ color: '#14b8a6', fontSize: 18, fontWeight: 700 }}>{taps.length} taps recorded</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Average inter-tap interval: {avgInterval}ms</p>
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
