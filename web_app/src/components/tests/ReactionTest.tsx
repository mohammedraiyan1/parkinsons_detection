import React, { useState, useRef } from 'react';

interface Props { onClose: () => void; }

export default function ReactionTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'waiting' | 'ready' | 'go' | 'early' | 'done'>('intro');
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [trial, setTrial] = useState(0);
  const timerRef = useRef<any>(null);

  const runTrial = () => {
    setPhase('ready');
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => { setStartTime(Date.now()); setPhase('go'); }, delay);
  };

  const handleClick = () => {
    if (phase === 'intro') { setTrial(1); setPhase('waiting'); }
    else if (phase === 'waiting') runTrial();
    else if (phase === 'ready') { clearTimeout(timerRef.current); setPhase('early'); }
    else if (phase === 'go') {
      const rt = Date.now() - startTime;
      const newTimes = [...times, rt];
      setTimes(newTimes);
      const nextTrial = trial + 1;
      setTrial(nextTrial);
      if (nextTrial > 5) setPhase('done');
      else { setPhase('waiting'); }
    }
    else if (phase === 'early') runTrial();
  };

  const bg = phase === 'go' ? 'linear-gradient(135deg, #22c55e, #16a34a)'
    : phase === 'ready' ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #1e40af, #1d4ed8)';

  const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0) : '—';

  return (
    <div className="modal" style={{ maxWidth: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>⚡ Reaction Time</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase !== 'done' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Trial {Math.min(trial, 5)} of 5 &nbsp;|&nbsp; Avg: {avg}ms</p>
          <div onClick={handleClick} style={{ height: 240, borderRadius: 20, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {phase === 'intro' ? '👆' : phase === 'waiting' ? '🖱️' : phase === 'ready' ? '🔴' : phase === 'early' ? '⚠️' : '🟢'}
            </div>
            <p style={{ fontWeight: 800, fontSize: 22, color: 'white' }}>
              {phase === 'intro' ? 'Click to Begin' : phase === 'waiting' ? 'Click when Ready →' : phase === 'ready' ? 'Wait for Green...' : phase === 'early' ? 'Too Early! Click to retry' : 'CLICK NOW!'}
            </p>
          </div>
        </>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>All 5 Trials Complete!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, margin: '20px 0' }}>
            <div className="card" style={{ padding: 16 }}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Average</div><div style={{ fontWeight: 800, color: '#f97316', fontSize: 22 }}>{avg}ms</div></div>
            <div className="card" style={{ padding: 16 }}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Best</div><div style={{ fontWeight: 800, color: '#22c55e', fontSize: 22 }}>{Math.min(...times)}ms</div></div>
            <div className="card" style={{ padding: 16 }}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Worst</div><div style={{ fontWeight: 800, color: '#ef4444', fontSize: 22 }}>{Math.max(...times)}ms</div></div>
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
