import { useRef, useState, useEffect } from 'react';

interface Props { onClose: () => void; }

const EXPRESSIONS = ['Neutral', 'Happy', 'Sad', 'Surprised', 'Angry'];

export default function FacialTest({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<'intro' | 'camera' | 'capture' | 'done'>('intro');
  const [currentExpr, setCurrentExpr] = useState(0);
  const [captures, setCaptures] = useState<string[]>([]);
  const [camError, setCamError] = useState('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
      streamRef.current = stream;
      setPhase('camera');
    } catch (e: any) {
      console.error('Camera Error:', e);
      setCamError(`Camera error: ${e.message || 'Access denied'}. Please check your browser permissions.`);
    }
  };

  useEffect(() => {
    if (phase === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
        setCamError('Failed to start video playback. Please interact with the page and try again.');
      });
    }
  }, [phase]);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      console.warn('Video not ready for capture');
      return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const next = currentExpr + 1;
    setCaptures(c => [...c, dataUrl]);
    if (next >= EXPRESSIONS.length) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      setPhase('done');
    } else {
      setCurrentExpr(next);
    }
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  return (
    <div className="modal" style={{ maxWidth: 540 }}>
      <div className="modal-header">
        <h3 className="modal-title">Facial Expression Analysis</h3>
        <button className="modal-close" onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose(); }}>✕</button>
      </div>

      {phase === 'intro' && (
        <>
          <div style={{ background: '#1a1d2e', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13.5, color: '#9ca3af', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 10 }}>Parkinson's disease often causes <strong style={{ color: '#e8eaf0' }}>facial masking</strong> — reduced spontaneous facial animation. This test captures 5 facial expressions using your camera.</p>
              <p>You will be prompted to make 5 expressions: <strong style={{ color: '#6366f1' }}>{EXPRESSIONS.join(' · ')}</strong></p>
            </div>
          </div>
          {camError && <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>{camError}</div>}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#818cf8' }}>
            📷 Camera access required for this test. Your photos are processed locally and never stored.
          </div>
          <button className="btn btn-primary btn-full" onClick={startCamera}>Enable Camera & Start</button>
        </>
      )}

      {phase === 'camera' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div className="flex items-center justify-between mb-8">
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Expression {currentExpr + 1} of {EXPRESSIONS.length}</span>
              <div className="progress-track" style={{ width: 160 }}>
                <div className="progress-fill" style={{ width: `${((currentExpr) / EXPRESSIONS.length) * 100}%`, background: '#6366f1' }} />
              </div>
            </div>
            <div style={{ background: '#6366f1', borderRadius: 8, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Make this expression</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{EXPRESSIONS[currentExpr]}</div>
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0f1117', marginBottom: 16 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }} />
            {/* crosshair overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 160, height: 200, border: '2px solid rgba(99,102,241,0.6)', borderRadius: '50%' }} />
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button className="btn btn-primary btn-full btn-lg" onClick={captureFrame}>
            📸 Capture "{EXPRESSIONS[currentExpr]}"
          </button>
        </>
      )}

      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#e8eaf0' }}>All expressions captured</h3>
          <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
            {EXPRESSIONS.length} facial expression frames collected. These will be included in your assessment report.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {EXPRESSIONS.map((e, i) => (
              <div key={e} style={{ textAlign: 'center' }}>
                <img src={captures[i] || ''} alt={e} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #2d2f3e', marginBottom: 4, transform: 'scaleX(-1)' }} />
                <div style={{ fontSize: 11, color: '#6b7280' }}>{e}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
