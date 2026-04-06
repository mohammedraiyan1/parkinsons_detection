import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CANVAS_SIZE = 400;   // px (square canvas)
const GUIDE_TURNS = 4;     // how many turns the guide spiral has

/** Draw a faint Archimedean spiral guide on the canvas */
function drawGuideSpiral(ctx, cx, cy, maxR) {
  ctx.save();
  ctx.strokeStyle = "rgba(127, 119, 221, 0.15)";
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  const steps  = GUIDE_TURNS * 360;
  const aConst = maxR / (GUIDE_TURNS * 2 * Math.PI);
  for (let i = 0; i <= steps; i++) {
    const theta = (i / 360) * Math.PI * 2;
    const r     = aConst * theta;
    const x     = cx + r * Math.cos(theta - Math.PI / 2);
    const y     = cy + r * Math.sin(theta - Math.PI / 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // center dot
  ctx.save();
  ctx.fillStyle = "rgba(127, 119, 221, 0.3)";
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function SpiralTest({ onComplete }) {
  const [phase, setPhase]     = useState("idle");   // idle | drawing | processing | done | error
  const [hasDrawn, setHasDrawn] = useState(false);
  const [result, setResult]   = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [strokeCount, setStrokeCount] = useState(0);

  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef({ x: 0, y: 0 });

  // ── canvas setup ─────────────────────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    drawGuideSpiral(ctx, cx, cy, CANVAS_SIZE * 0.44);

    // setup stroke style for user drawing
    ctx.strokeStyle = "#1A2B4A";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.setLineDash([]);
  }, []);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  // ── drawing helpers ────────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    isDrawing.current = true;
    lastPos.current   = pos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setPhase("drawing");
    setHasDrawn(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e?.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setStrokeCount(s => s + 1);
  };

  // ── clear ─────────────────────────────────────────────────────────────────
  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
    setPhase("idle");
    setStrokeCount(0);
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    const canvas = canvasRef.current;

    // export to greyscale PNG for better OpenCV processing
    const offscreen = document.createElement("canvas");
    offscreen.width  = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const octx = offscreen.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    octx.drawImage(canvas, 0, 0);
    const dataUrl = offscreen.toDataURL("image/png");

    setPhase("processing");
    try {
      const { data } = await axios.post(`${API}/api/predict/spiral`,
        { image: dataUrl },
        { headers: { "Content-Type": "application/json" }, timeout: 20000 }
      );
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
    setHasDrawn(false);
    setStrokeCount(0);
    initCanvas();
  };

  const riskColor = (level) =>
    level === "Low" ? "#1D9E75" : level === "Moderate" ? "#BA7517" : "#A32D2D";
  const riskBg = (level) =>
    level === "Low" ? "#E1F5EE" : level === "Moderate" ? "#FAEEDA" : "#FCEBEB";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>

      {/* header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#EEEDFE", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 12px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 6px" }}>Spiral drawing test</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
          Trace the faint spiral guide as smoothly as possible, starting from the centre
          and working outward. Draw continuously in one stroke.
        </p>
      </div>

      {/* canvas container */}
      <div style={{
        position: "relative",
        border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        background: "#fff",
        touchAction: "none",
        cursor: phase === "processing" || phase === "done" ? "default" : "crosshair",
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ display: "block", width: "100%", height: "auto" }}
          onMouseDown={phase === "processing" || phase === "done" ? null : startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={phase === "processing" || phase === "done" ? null : startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* overlay hint before drawing */}
        {phase === "idle" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: 8, padding: "8px 16px",
              fontSize: 13, color: "var(--color-text-secondary)",
            }}>
              Touch or click to start drawing
            </div>
          </div>
        )}

        {/* processing overlay */}
        {phase === "processing" && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.8)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "3px solid var(--color-border-tertiary)",
              borderTopColor: "#534AB7",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              Analysing tremor patterns...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      {/* stroke counter */}
      <p style={{ textAlign: "center", fontSize: 12,
                  color: "var(--color-text-tertiary)", marginBottom: 16 }}>
        {hasDrawn ? `${strokeCount} stroke${strokeCount !== 1 ? "s" : ""} drawn` : "Draw the spiral above"}
      </p>

      {/* result card */}
      {phase === "done" && result && (
        <div style={{
          background: riskBg(result.risk_level),
          border: `0.5px solid ${riskColor(result.risk_level)}40`,
          borderRadius: 12, padding: "20px 24px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Spiral score</span>
            <span style={{ fontSize: 28, fontWeight: 500, color: riskColor(result.risk_level) }}>
              {result.score.toFixed(1)}
            </span>
          </div>
          <div style={{
            display: "inline-block", fontSize: 12, fontWeight: 500,
            padding: "3px 12px", borderRadius: 20,
            background: riskColor(result.risk_level), color: "#fff", marginBottom: 12,
          }}>
            {result.risk_level} risk
          </div>

          {result.features && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(result.features)
                .filter(([k]) => k !== "n_points")
                .map(([k, v]) => (
                <div key={k} style={{
                  background: "rgba(255,255,255,0.6)", borderRadius: 8,
                  padding: "8px 10px",
                }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>
                    {k.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {typeof v === "number" ? v.toFixed(4) : v}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* error */}
      {phase === "error" && (
        <div style={{
          background: "#FCEBEB", border: "0.5px solid #E24B4A40",
          borderRadius: 12, padding: "16px 20px", marginBottom: 16,
          fontSize: 14, color: "#A32D2D",
        }}>
          {errorMsg}
        </div>
      )}

      {/* buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {(phase === "idle" || phase === "drawing" || phase === "error") && (
          <>
            {hasDrawn && (
              <button
                onClick={clearCanvas}
                style={{
                  padding: "14px 20px", fontSize: 14,
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 10, cursor: "pointer",
                  color: "var(--color-text-primary)",
                }}
              >
                Clear
              </button>
            )}
            {hasDrawn && (
              <button
                onClick={submit}
                disabled={!hasDrawn}
                style={{
                  flex: 1, padding: "14px", fontSize: 15, fontWeight: 500,
                  background: hasDrawn ? "#534AB7" : "var(--color-border-secondary)",
                  color: hasDrawn ? "#fff" : "var(--color-text-tertiary)",
                  border: "none", borderRadius: 10,
                  cursor: hasDrawn ? "pointer" : "default",
                }}
              >
                Analyse spiral
              </button>
            )}
          </>
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
              Redraw
            </button>
            <button
              onClick={() => onComplete(result)}
              style={{
                flex: 2, padding: "14px", fontSize: 15, fontWeight: 500,
                background: "#534AB7", color: "#fff", border: "none",
                borderRadius: 10, cursor: "pointer",
              }}
            >
              Next — clinical form
            </button>
          </>
        )}
      </div>

      <p style={{
        textAlign: "center", fontSize: 11, color: "var(--color-text-tertiary)",
        marginTop: 16, lineHeight: 1.4,
      }}>
        Drawing data is processed locally. This is a screening aid only.
      </p>
    </div>
  );
}
