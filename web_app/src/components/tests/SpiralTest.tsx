import React, { useRef, useState } from 'react';

interface Props { onClose: () => void; }

function drawGuideSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  let angle = 0;
  while (angle < Math.PI * 8) {
    const r = (angle / (Math.PI * 8)) * 130;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (angle === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    angle += 0.05;
  }
  ctx.stroke();
}

export default function SpiralTest({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const pathRef = useRef<{ x: number; y: number }[]>([]);

  const init = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideSpiral(ctx, canvas.width / 2, canvas.height / 2);
  };

  const getPos = (e: React.MouseEvent | React.PointerEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e as any).clientX - r.left, y: (e as any).clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const p = getPos(e, canvasRef.current!);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    pathRef.current = [p];
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const p = getPos(e, canvasRef.current!);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.stroke();
    pathRef.current.push(p);
  };
  const onPointerUp = () => { setDrawing(false); setDrawn(true); };

  return (
    <div className="modal" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>🌀 Spiral Drawing</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontSize: 14 }}>Trace the gray spiral guide with your mouse as accurately and smoothly as possible.</p>
      <canvas ref={canvasRef} width={480} height={320} className="drawing-canvas"
        style={{ width: '100%' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        ref={el => { canvasRef.current = el; if (el && !drawn) init(el); }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setDrawn(false); if (canvasRef.current) init(canvasRef.current); }}>🗑 Clear</button>
        <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={onClose} disabled={!drawn}>Save & Continue →</button>
      </div>
    </div>
  );
}
