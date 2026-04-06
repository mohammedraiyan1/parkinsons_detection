import { useState, useRef, useEffect } from 'react';

interface Props { onClose: () => void; }

export default function VoiceTest({ onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'recording' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(5);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const drawWave = () => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(buf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5; ctx.beginPath();
      const sl = canvas.width / buf.length;
      let x = 0;
      buf.forEach((v, i) => { const y = (v / 128) * canvas.height / 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); x += sl; });
      ctx.stroke();
    };
    draw();
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        cancelAnimationFrame(animRef.current);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setPhase('recording');

      let t = 5;
      intervalRef.current = setInterval(() => {
        t--;
        setTimeLeft(t);
        if (t <= 0) { clearInterval(intervalRef.current); recorder.stop(); setPhase('done'); }
      }, 1000);
    } catch { alert('Microphone access denied. Please allow microphone permissions.'); }
  };

  useEffect(() => {
    if (phase === 'recording' && canvasRef.current && analyserRef.current) {
      drawWave();
    }
  }, [phase]);

  useEffect(() => () => { clearInterval(intervalRef.current); cancelAnimationFrame(animRef.current); }, []);

  return (
    <div className="modal" style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>🎙️ Voice Test</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      {phase === 'intro' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24 }}>Take a deep breath and say <strong style={{ color: '#f97316' }}>"ahhhhh"</strong> as long and steadily as possible for 5 seconds. The test measures voice tremor and stability.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={start}>🎙 Start Recording</button>
        </>
      )}
      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <canvas ref={canvasRef} width={400} height={80} style={{ width: '100%', borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 20 }} />
          <button className="record-btn recording" style={{ margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔴</button>
          <p style={{ color: '#f97316', fontWeight: 700, fontSize: 24 }}>{timeLeft}s</p>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Say "ahhh" steadily...</p>
        </div>
      )}
      {phase === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Recording Complete!</h3>
          {audioUrl && <audio controls src={audioUrl} style={{ width: '100%', marginBottom: 20, borderRadius: 8 }} />}
          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={onClose}>Save & Continue →</button>
        </div>
      )}
    </div>
  );
}
