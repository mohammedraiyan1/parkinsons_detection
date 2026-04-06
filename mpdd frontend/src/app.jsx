import { useState } from "react";
import axios from "axios";
import VoiceTest   from "./components/VoiceTest";
import SpiralTest  from "./components/SpiralTest";
import Results     from "./components/Results";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STEPS = ["Voice", "Spiral", "Clinical", "Results"];

function Stepper({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 0, marginBottom: 36 }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 500,
              background: i < current  ? "#534AB7"
                        : i === current ? "#EEEDFE"
                        : "var(--color-background-secondary)",
              color: i < current  ? "#fff"
                   : i === current ? "#534AB7"
                   : "var(--color-text-tertiary)",
              border: i === current ? "2px solid #534AB7" : "none",
              transition: "all 0.3s",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 11,
              color: i === current ? "#534AB7"
                   : i < current  ? "var(--color-text-secondary)"
                   : "var(--color-text-tertiary)",
              fontWeight: i === current ? 500 : 400,
            }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 48, height: 2, marginBottom: 18,
              background: i < current ? "#534AB7" : "var(--color-border-tertiary)",
              transition: "background 0.4s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ClinicalForm({ onComplete }) {
  const [form, setForm] = useState({
    age: 60, gender: "male", family_history: false,
    tremor_severity: 0, bradykinesia: false, rigidity: false,
    balance_issues: false, sleep_disorder: false,
    smell_loss: false, constipation: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.post(`${API}/api/predict/clinical`, form);
      onComplete(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ label, field, hint }) => (
    <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", padding: "10px 0",
                  borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <div>
        <div style={{ fontSize: 14 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{hint}</div>}
      </div>
      <label style={{ position: "relative", display: "inline-block",
                      width: 40, height: 22, flexShrink: 0, marginLeft: 12 }}>
        <input type="checkbox" checked={form[field]}
               onChange={e => set(field, e.target.checked)}
               style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: "absolute", inset: 0, borderRadius: 11,
          background: form[field] ? "#534AB7" : "var(--color-border-secondary)",
          cursor: "pointer", transition: "background 0.2s",
        }}>
          <span style={{
            position: "absolute", top: 3, left: form[field] ? 21 : 3,
            width: 16, height: 16, borderRadius: "50%",
            background: "#fff", transition: "left 0.2s",
          }} />
        </span>
      </label>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#EEEDFE", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 12px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 6px" }}>Clinical risk factors</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
          Answer based on your current health status.
        </p>
      </div>

      <div style={{ background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: 12, padding: "20px", marginBottom: 16 }}>

        {/* Age */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
            <span>Age</span>
            <span style={{ fontWeight: 500 }}>{form.age}</span>
          </div>
          <input type="range" min={18} max={90} value={form.age}
                 onChange={e => set("age", +e.target.value)}
                 style={{ width: "100%" }} />
        </div>

        {/* Gender */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Gender</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["male", "female", "other"].map(g => (
              <button key={g} onClick={() => set("gender", g)} style={{
                flex: 1, padding: "9px", fontSize: 13, borderRadius: 8,
                border: form.gender === g ? "2px solid #534AB7" : "0.5px solid var(--color-border-secondary)",
                background: form.gender === g ? "#EEEDFE" : "var(--color-background-primary)",
                color: form.gender === g ? "#534AB7" : "var(--color-text-primary)",
                cursor: "pointer", fontWeight: form.gender === g ? 500 : 400,
              }}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tremor severity */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
            <span>Resting tremor severity <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>(UPDRS 0–4)</span></span>
            <span style={{ fontWeight: 500 }}>{form.tremor_severity}</span>
          </div>
          <input type="range" min={0} max={4} step={1} value={form.tremor_severity}
                 onChange={e => set("tremor_severity", +e.target.value)}
                 style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4 }}>
            <span>None</span><span>Slight</span><span>Mild</span><span>Moderate</span><span>Severe</span>
          </div>
        </div>

        <Toggle label="Slowness of movement (bradykinesia)"
                hint="Difficulty starting movement, slow walking"
                field="bradykinesia" />
        <Toggle label="Muscle stiffness (rigidity)"
                hint="Stiff arms, legs or neck"
                field="rigidity" />
        <Toggle label="Balance or coordination problems"
                hint="Unsteadiness when standing or walking"
                field="balance_issues" />
        <Toggle label="REM sleep behaviour disorder"
                hint="Acting out dreams, shouting in sleep"
                field="sleep_disorder" />
        <Toggle label="Loss of sense of smell"
                hint="Difficulty detecting or identifying smells"
                field="smell_loss" />
        <Toggle label="Chronic constipation"
                hint="Fewer than 3 bowel movements per week"
                field="constipation" />
        <Toggle label="Family history of Parkinson's"
                hint="Parent, sibling or child with Parkinson's"
                field="family_history" />
      </div>

      {error && (
        <div style={{ background: "#FCEBEB", borderRadius: 8, padding: "12px 16px",
                      fontSize: 13, color: "#A32D2D", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button onClick={submit} disabled={loading} style={{
        width: "100%", padding: "15px", fontSize: 15, fontWeight: 500,
        background: loading ? "var(--color-border-secondary)" : "#534AB7",
        color: loading ? "var(--color-text-tertiary)" : "#fff",
        border: "none", borderRadius: 10,
        cursor: loading ? "default" : "pointer",
      }}>
        {loading ? "Calculating..." : "See my results"}
      </button>
    </div>
  );
}

// ── main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]     = useState(0);  // 0 landing, 1 voice, 2 spiral, 3 clinical, 4 results
  const [scores, setScores] = useState({});

  const onVoiceDone    = (r)  => { setScores(s => ({ ...s, voiceResult: r }));    setStep(2); };
  const onSpiralDone   = (r)  => { setScores(s => ({ ...s, spiralResult: r }));   setStep(3); };
  const onClinicalDone = (r)  => { setScores(s => ({ ...s, clinicalResult: r })); setStep(4); };
  const onRestart      = ()   => { setScores({}); setStep(0); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>

      {/* nav */}
      <nav style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0 24px",
        display: "flex", alignItems: "center", height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#534AB7", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500 }}>NeuroCheck</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12,
                      color: "var(--color-text-tertiary)" }}>
          Screening aid only — not a diagnosis
        </div>
      </nav>

      {/* content */}
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px" }}>

        {step === 0 && <Landing onStart={() => setStep(1)} />}

        {step >= 1 && step <= 4 && (
          <Stepper current={step - 1} />
        )}

        {step === 1 && <VoiceTest    onComplete={onVoiceDone} />}
        {step === 2 && <SpiralTest   onComplete={onSpiralDone} />}
        {step === 3 && <ClinicalForm onComplete={onClinicalDone} />}
        {step === 4 && <Results      scores={scores} onRestart={onRestart} />}
      </main>
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 16px" }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: "#534AB7", display: "flex",
        alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 10px" }}>NeuroCheck</h1>
      <p style={{ fontSize: 16, color: "var(--color-text-secondary)",
                  maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.6 }}>
        A multi-modal Parkinson's disease screening tool using voice, spiral drawing,
        and clinical biomarkers.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
                    gap: 12, maxWidth: 420, margin: "0 auto 32px" }}>
        {[
          { icon: "🎙", title: "Voice", desc: "Sustained phonation analysis" },
          { icon: "◎",  title: "Spiral", desc: "Tremor pattern detection" },
          { icon: "📋", title: "Clinical", desc: "Symptom risk assessment" },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 12, padding: "16px 12px",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{desc}</div>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        padding: "16px 48px", fontSize: 16, fontWeight: 500,
        background: "#534AB7", color: "#fff", border: "none",
        borderRadius: 12, cursor: "pointer",
      }}>
        Start assessment
      </button>

      <p style={{ marginTop: 16, fontSize: 12, color: "var(--color-text-tertiary)",
                  maxWidth: 380, margin: "16px auto 0", lineHeight: 1.5 }}>
        This tool is for screening purposes only and does not provide a medical diagnosis.
        Always consult a qualified neurologist for clinical evaluation.
      </p>
    </div>
  );
}
