import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── helpers ────────────────────────────────────────────────────────────────────
const riskColor = (l) => l === "Low" ? "#1D9E75" : l === "Moderate" ? "#BA7517" : "#A32D2D";
const riskBg    = (l) => l === "Low" ? "#E1F5EE" : l === "Moderate" ? "#FAEEDA" : "#FCEBEB";
const riskLight = (l) => l === "Low" ? "#9FE1CB" : l === "Moderate" ? "#FAC775" : "#F7C1C1";

function lerp(a, b, t) { return a + (b - a) * t; }

/** Animated counter that counts up from 0 to target */
function AnimatedNumber({ target, duration = 1400, decimals = 1 }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(parseFloat(lerp(0, target, ease).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return <span>{val.toFixed(decimals)}</span>;
}

/** SVG circular gauge */
function GaugeChart({ score, riskLevel }) {
  const SIZE   = 200;
  const STROKE = 16;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  // 270° arc (from -225° to 45°)
  const ARC    = CIRC * 0.75;
  const fill   = (score / 100) * ARC;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 1400, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimated(ease * fill);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [fill]);

  // track starts at bottom-left and goes clockwise 270°
  const cx = SIZE / 2, cy = SIZE / 2;
  const startAngle = 135 * (Math.PI / 180);
  const dashOffset = CIRC * 0.25;  // offset so arc starts at 135°

  return (
    <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
      {/* background track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--color-background-secondary)"
        strokeWidth={STROKE}
        strokeDasharray={`${ARC} ${CIRC - ARC}`}
        strokeDashoffset={-CIRC * 0.25 + CIRC}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />
      {/* coloured arc */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={riskColor(riskLevel)}
        strokeWidth={STROKE}
        strokeDasharray={`${animated} ${CIRC}`}
        strokeDashoffset={CIRC * 0.25}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
        style={{ transition: "stroke 0.5s" }}
      />
      {/* risk zone labels */}
      <text x={cx - 64} y={cy + 62} textAnchor="middle"
            fontSize="11" fill="#1D9E75" fontWeight="500">Low</text>
      <text x={cx}      y={cy + 74} textAnchor="middle"
            fontSize="11" fill="#BA7517" fontWeight="500">Moderate</text>
      <text x={cx + 64} y={cy + 62} textAnchor="middle"
            fontSize="11" fill="#A32D2D" fontWeight="500">High</text>
    </svg>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
export default function Results({ scores, onRestart }) {
  const {
    voiceResult    = {},
    spiralResult   = {},
    clinicalResult = {},
  } = scores;

  const [ensemble, setEnsemble]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saved, setSaved]         = useState(false);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // fetch ensemble on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.post(`${API}/api/predict/ensemble`, {
          voice_score:    voiceResult.score    ?? 0,
          spiral_score:   spiralResult.score   ?? 0,
          clinical_score: clinicalResult.score ?? 0,
          shap_top:       voiceResult.shap_top ?? [],
        });
        setEnsemble(data);

        // auto-save
        await axios.post(`${API}/api/save-result`, {
          voice_score:    voiceResult.score,
          spiral_score:   spiralResult.score,
          clinical_score: clinicalResult.score,
          final_score:    data.final_score,
          risk_level:     data.risk_level,
          shap_top:       voiceResult.shap_top ?? [],
        });
        setSaved(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/api/results`);
      setHistory(data);
      setShowHistory(true);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid var(--color-border-tertiary)",
          borderTopColor: "#534AB7",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>
          Computing your risk profile...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!ensemble) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ color: "#A32D2D", marginBottom: 16 }}>
          Could not compute ensemble score. Please try again.
        </p>
        <button onClick={onRestart} style={btnStyle("secondary")}>Start over</button>
      </div>
    );
  }

  const { final_score, risk_level, recommendation, modality_scores, shap_top, disclaimer } = ensemble;

  // data for recharts
  const radarData = [
    { subject: "Voice",    score: modality_scores.voice    ?? 0 },
    { subject: "Spiral",   score: modality_scores.spiral   ?? 0 },
    { subject: "Clinical", score: modality_scores.clinical ?? 0 },
  ];

  const shapData = (shap_top ?? []).map(f => ({
    name:  f.feature.replace("MDVP:", "").replace("(Hz)", "").replace("(%)", ""),
    value: Math.abs(f.value),
    raw:   f.value,
  }));

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* ── hero score ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <GaugeChart score={final_score} riskLevel={risk_level} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -54%)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 42, fontWeight: 500, lineHeight: 1,
                          color: riskColor(risk_level) }}>
              <AnimatedNumber target={final_score} />
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
              out of 100
            </div>
          </div>
        </div>

        {/* risk badge */}
        <div style={{
          display: "inline-block", marginTop: 8,
          padding: "6px 20px", borderRadius: 24,
          background: riskColor(risk_level), color: "#fff",
          fontSize: 15, fontWeight: 500, letterSpacing: "0.02em",
        }}>
          {risk_level} risk
        </div>

        <p style={{
          maxWidth: 420, margin: "16px auto 0",
          fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6,
        }}>
          {recommendation}
        </p>
      </div>

      {/* ── modality scores ────────────────────────────────────────────────── */}
      <Section title="Test breakdown">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Voice",    score: modality_scores.voice,    weight: "40%" },
            { label: "Spiral",   score: modality_scores.spiral,   weight: "30%" },
            { label: "Clinical", score: modality_scores.clinical, weight: "30%" },
          ].map(({ label, score, weight }) => {
            const level = score < 35 ? "Low" : score < 65 ? "Moderate" : "High";
            return (
              <div key={label} style={{
                background: riskBg(level),
                borderRadius: 10, padding: "14px 12px", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                  {label} <span style={{ opacity: 0.6 }}>({weight})</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 500, color: riskColor(level) }}>
                  {score != null ? score.toFixed(1) : "—"}
                </div>
                <div style={{
                  fontSize: 11, marginTop: 4,
                  color: riskColor(level), fontWeight: 500,
                }}>
                  {level}
                </div>
              </div>
            );
          })}
        </div>

        {/* radar chart */}
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData} style={{ fontSize: 13 }}>
            <PolarGrid stroke="var(--color-border-tertiary)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
            <Radar name="Score" dataKey="score" domain={[0, 100]}
                   stroke={riskColor(risk_level)} fill={riskColor(risk_level)}
                   fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </Section>

      {/* ── score bars ─────────────────────────────────────────────────────── */}
      <Section title="Score bars">
        {[
          { label: "Voice analysis",   score: modality_scores.voice },
          { label: "Spiral drawing",   score: modality_scores.spiral },
          { label: "Clinical factors", score: modality_scores.clinical },
          { label: "Composite score",  score: final_score, bold: true },
        ].map(({ label, score, bold }) => {
          const level = score < 35 ? "Low" : score < 65 ? "Moderate" : "High";
          return (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                            fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: bold ? 500 : 400 }}>{label}</span>
                <span style={{ color: riskColor(level), fontWeight: 500 }}>
                  {score != null ? score.toFixed(1) : "—"}
                </span>
              </div>
              <div style={{ height: bold ? 10 : 7,
                            background: "var(--color-background-secondary)",
                            borderRadius: 5 }}>
                <div style={{
                  height: "100%", borderRadius: 5,
                  background: riskColor(level),
                  width: `${score ?? 0}%`,
                  transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── SHAP feature importance ────────────────────────────────────────── */}
      {shapData.length > 0 && (
        <Section title="Key voice biomarkers (SHAP)">
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
            These voice features contributed most to the prediction. Positive values increase risk; negative values decrease it.
          </p>
          <ResponsiveContainer width="100%" height={shapData.length * 36 + 20}>
            <BarChart
              data={shapData}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v, n, { payload }) =>
                  [`${payload.raw > 0 ? "+" : ""}${payload.raw.toFixed(4)}`, "SHAP value"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {shapData.map((d, i) => (
                  <Cell key={i}
                    fill={d.raw > 0 ? riskColor(risk_level) : "#1D9E75"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ── history ────────────────────────────────────────────────────────── */}
      {showHistory && history.length > 0 && (
        <Section title="Previous assessments">
          {history.map((r, i) => {
            const level = r.risk_level ?? "Low";
            return (
              <div key={r.id ?? i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: i < history.length - 1
                  ? "0.5px solid var(--color-border-tertiary)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    Score: {r.final_score != null ? r.final_score.toFixed(1) : "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 500, padding: "3px 10px",
                  borderRadius: 20, background: riskBg(level), color: riskColor(level),
                }}>
                  {level}
                </span>
              </div>
            );
          })}
        </Section>
      )}

      {/* ── disclaimer ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10, padding: "14px 16px", marginBottom: 20,
        fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6,
      }}>
        <strong style={{ color: "var(--color-text-primary)" }}>Disclaimer: </strong>
        {disclaimer}
      </div>

      {/* ── action buttons ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={loadHistory} style={btnStyle("secondary")}>
          View history
        </button>
        <button onClick={() => window.print()} style={btnStyle("secondary")}>
          Print report
        </button>
        <button onClick={onRestart}
          style={{ ...btnStyle("primary"), gridColumn: "1 / -1" }}>
          Start new assessment
        </button>
      </div>

      {saved && (
        <p style={{ textAlign: "center", fontSize: 12,
                    color: "#1D9E75", marginTop: 12 }}>
          Assessment saved to history
        </p>
      )}
    </div>
  );
}

// ── small helpers ──────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, padding: "20px", marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, margin: "0 0 16px",
                   color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function btnStyle(variant) {
  if (variant === "primary") return {
    padding: "14px", fontSize: 15, fontWeight: 500,
    background: "#534AB7", color: "#fff", border: "none",
    borderRadius: 10, cursor: "pointer",
  };
  return {
    padding: "12px", fontSize: 14,
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-secondary)",
    borderRadius: 10, cursor: "pointer",
    color: "var(--color-text-primary)",
  };
}
