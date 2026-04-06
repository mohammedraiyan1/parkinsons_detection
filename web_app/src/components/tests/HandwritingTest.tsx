import React, { useRef, useState } from 'react';

interface Props { onClose: () => void; }

export default function HandwritingTest({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawn, setDrawn] = useState(false);

  const getPos = (e: React.PointerEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const drawLines = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw guide lines
    for (let y = 80; y < canvas.height - 20; y += 80) {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      ctx.moveTo(20, y); ctx.lineTo(canvas.width - 20, y); ctx.stroke();
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const p = getPos(e, canvasRef.current!);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const p = getPos(e, canvasRef.current!);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#14b8a6'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    setDrawn(true);
  };
  const onPointerUp = () => setDrawing(false);

  return (
    <div className="modal" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>✍️ Handwriting Test</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <div style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <p style={{ color: '#2dd4bf', fontSize: 14, fontWeight: 600 }}>Write: "The quick brown fox jumps over the lazy dog"</p>
      </div>
      <canvas ref={canvasRef} width={480} height={240} className="drawing-canvas" style={{ width: '100%' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        ref={el => { canvasRef.current = el; if (el && !drawn) drawLines(el); }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setDrawn(false); if (canvasRef.current) drawLines(canvasRef.current); }}>🗑 Clear</button>
        <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={onClose} disabled={!drawn}>Save & Continue →</button>
      </div>
    </div>
  );
}
