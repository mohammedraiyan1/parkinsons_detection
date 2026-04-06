import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const RECORD_SECONDS = 5;
const WAVEFORM_BARS  = 60;

export default function VoiceTest({ onComplete }) {
  const [phase, setPhase]         = useState("idle");   // idle | countdown | recording | processing | done | error
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed]     = useState(0);
  const [bars, setBars]           = useState(Array(WAVEFORM_BARS).fill(3));
  const [result, setResult]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");

  const mediaRecorderRef = useRef(null);
  const audioCtxRef      = useRef(null);
  const analyserRef      = useRef(null);
  const animFrameRef     = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);

  // cleanup on unmount
  useEffect(() => () => {
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(timerRef.current);
    audioCtxRef.current?.close();
  }, []);

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    // sample WAVEFORM_BARS evenly spaced frequencies
    const step = Math.floor(data.length / WAVEFORM_BARS);
    setBars(Array.from({ length: WAVEFORM_BARS }, (_, i) => {
      const val = data[i * step] || 0;
      return Math.max(3, Math.round((val / 255) * 72));
    }));
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startCountdown = async () => {
    setPhase("countdown");
    setCountdown(3);

    // request mic early so first click gets permission prompt
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMsg("Microphone access denied. Please allow microphone in your browser settings.");
      setPhase("error");
      return;
    }

    let count = 3;
    const cd = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(cd);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = handleStop;
      mr.start(100);
      mediaRecorderRef.current = mr;

      setPhase("recording");
      setElapsed(0);
      drawWaveform();

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs += 1;
        setElapsed(secs);
        if (secs >= RECORD_SECONDS) {
          clearInterval(timerRef.current);
          mr.stop();
          stream.getTracks().forEach(t => t.stop());
        }
      }, 1000);
    } catch (err) {
      setErrorMsg("Could not start recording: " + err.message);
      setPhase("error");
    }
  };

  const handleStop = async () => {
    cancelAnimationFrame(animFrameRef.current);
    setBars(Array(WAVEFORM_BARS).fill(3));
    setPhase("processing");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "voice.webm");

    try {
      const { data } = await axios.post(`${API}/api/predict/voice`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setResult(data);
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Server error");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setErrorMsg("");
    setElapsed(0);
    setBars(Array(WAVEFORM_BARS).fill(3));
  };

  const riskColor = (level) =>
    level === "Low" ? "#1D9E75" : level === "Moderate" ? "#BA7517" : "#A32D2D";

  const riskBg = (level) =>
    level === "Low" ? "#E1F5EE" : level === "Moderate" ? "#FAEEDA" : "#FCEBEB";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>

      {/* header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#EEEDFE", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 12px", fontSize: 24,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 6px" }}>Voice analysis</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
          Sustain a steady <strong>"Aaaaah"</strong> sound for {RECORD_SECONDS} seconds after the countdown.
          Keep your voice as steady and loud as possible.
        </p>
      </div>

      {/* waveform display */}
      <div style={{
        background: "var(--color-background-secondary)",
        borderRadius: 12, padding: "20px 16px",
        marginBottom: 24, minHeight: 100,
        display: "flex", alignItems: "flex-end",
        justifyContent: "center", gap: 2,
        border: "0.5px solid var(--color-border-tertiary)",
      }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: `${100 / WAVEFORM_BARS}%`,
            maxWidth: 8,
            height: h,
            borderRadius: 3,
            background: phase === "recording"
              ? `hsl(${260 - i * 2}, 60%, ${50 + (h / 72) * 20}%)`
              : "var(--color-border-secondary)",
            transition: phase === "recording" ? "height 0.05s" : "height 0.3s",
          }} />
        ))}
      </div>

      {/* countdown */}
      {phase === "countdown" && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            fontSize: 72, fontWeight: 500, lineHeight: 1,
            color: "#534AB7", marginBottom: 8,
          }}>{countdown}</div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Get ready to say "Aaaaah"...
          </p>
        </div>
      )}

      {/* recording progress */}
      {phase === "recording" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#A32D2D", fontWeight: 500 }}>
              Recording...
            </span>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              {elapsed}s / {RECORD_SECONDS}s
            </span>
          </div>
          <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3 }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: "#A32D2D",
              width: `${(elapsed / RECORD_SECONDS) * 100}%`,
              transition: "width 1s linear",
            }} />
          </div>
          <p style={{ textAlign: "center", fontSize: 14, marginTop: 12,
                      color: "var(--color-text-secondary)" }}>
            Keep saying "Aaaaaah" steadily...
          </p>
        </div>
      )}

      {/* processing */}
      {phase === "processing" && (
        <div style={{ textAlign: "center", padding: "16px 0", marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid var(--color-border-tertiary)",
            borderTopColor: "#534AB7",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
            Analysing voice biomarkers...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* result card */}
      {phase === "done" && result && (
        <div style={{
          background: riskBg(result.risk_level),
          border: `0.5px solid ${riskColor(result.risk_level)}40`,
          borderRadius: 12, padding: "20px 24px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
              Voice score
            </span>
            <span style={{
              fontSize: 28, fontWeight: 500,
              color: riskColor(result.risk_level),
            }}>
              {result.score.toFixed(1)}
            </span>
          </div>

          <div style={{
            display: "inline-block", fontSize: 12, fontWeight: 500,
            padding: "3px 12px", borderRadius: 20,
            background: riskColor(result.risk_level),
            color: "#fff", marginBottom: 16,
          }}>
            {result.risk_level} risk
          </div>

          {result.shap_top?.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                Top contributing features (SHAP):
              </p>
              {result.shap_top.map((f, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                    <span style={{ color: "var(--color-text-primary)" }}>{f.feature}</span>
                    <span style={{ color: riskColor(result.risk_level), fontWeight: 500 }}>
                      {f.value > 0 ? "+" : ""}{f.value.toFixed(3)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(0,0,0,0.08)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      background: riskColor(result.risk_level),
                      width: `${Math.min(Math.abs(f.value) * 300, 100)}%`,
                    }} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* error */}
      {phase === "error" && (
        <div style={{
          background: "#FCEBEB", border: "0.5px solid #E24B4A40",
          borderRadius: 12, padding: "16px 20px", marginBottom: 20,
          fontSize: 14, color: "#A32D2D",
        }}>
          {errorMsg}
        </div>
      )}

      {/* action buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        {(phase === "idle" || phase === "error") && (
          <button
            onClick={startCountdown}
            style={{
              flex: 1, padding: "14px", fontSize: 15, fontWeight: 500,
              background: "#534AB7", color: "#fff", border: "none",
              borderRadius: 10, cursor: "pointer",
            }}
          >
            Start recording
          </button>
        )}

        {phase === "done" && (
          <>
            <button
              onClick={reset}
              style={{
                flex: 1, padding: "14px", fontSize: 14,
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: 10, cursor: "pointer",
                color: "var(--color-text-primary)",
              }}
            >
              Retake
            </button>
            <button
              onClick={() => onComplete(result)}
              style={{
                flex: 2, padding: "14px", fontSize: 15, fontWeight: 500,
                background: "#534AB7", color: "#fff", border: "none",
                borderRadius: 10, cursor: "pointer",
              }}
            >
              Next — spiral test
            </button>
          </>
        )}
      </div>

      <p style={{
        textAlign: "center", fontSize: 11, color: "var(--color-text-tertiary)",
        marginTop: 16, lineHeight: 1.4,
      }}>
        Audio is processed locally and never stored. This is a screening aid only.
      </p>
    </div>
  );
}
