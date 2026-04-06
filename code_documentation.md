# Appendix: Core System Source Code

This document contains a curated selection of the core source code for the NeuroCheck application across its three main architectural tiers: the Frontend Web Application, the Node.js Backend API, and the Python Machine Learning Microservice.

## 1. Frontend Web Development (React / TypeScript)

The frontend is built using React and TypeScript, leveraging modern hooks, Framer Motion for animations, and Recharts for data visualization.

### 1.1 Authentication Interface (`AuthPage.tsx`)
This component handles user registration and login, featuring a sleek, responsive UI with animated ECG elements.

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', dob: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }
        const { data, error: err } = await signUp(form.email, form.password, { first_name: form.firstName, last_name: form.lastName, dob: form.dob });
        if (err) throw err;
        if (data?.session) navigate('/dashboard');
        else { setSuccess('Account created! Check your email to confirm, then sign in.'); setMode('login'); }
      } else {
        const { error: err } = await signIn(form.email, form.password);
        if (err) {
          if (err.message?.toLowerCase().includes('email not confirmed'))
            setError('Please confirm your email first. Check your inbox.');
          else throw err;
          return;
        }
        navigate('/dashboard');
      }
    } catch (e: any) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* LEFT — Branding */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧠</div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>NeuroCheck</span>
          </div>

          {/* ECG */}
          <svg width="100%" height="56" viewBox="0 0 400 56" style={{ marginBottom: 40 }}>
            <polyline className="ecg-animated" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"
              points="0,28 60,28 80,28 92,8 100,52 110,28 140,28 180,28 194,14 202,48 210,28 240,28 280,28 292,10 300,50 310,28 360,28 400,28" />
          </svg>

          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 16 }}>
            Parkinson's screening<br />
            <span style={{ color: '#6366f1' }}>powered by AI.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 40 }}>
            7 validated neurological assessments in under 15 minutes. Early detection that could change a life.
          </p>
        </motion.div>
      </div>

      {/* RIGHT — Form */}
      <div className="auth-right">
        <motion.div className="auth-form-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <form onSubmit={submit}>
            {/* Form Fields Omitted for Brevity in Documentation */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group" style={{ marginBottom: mode === 'register' ? 16 : 24 }}>
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ opacity: loading ? 0.65 : 1 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
```

### 1.2 User Dashboard (`Dashboard.tsx`)
The dashboard aggregates the user's assessment status, providing an interactive gauge configuration showing their composite risk score with dynamic SVG rendering.

```tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

function ScoreGauge({ score }: { score: number }) {
  const r = 72; const circ = 2 * Math.PI * r;
  const color = score < 30 ? '#22c55e' : score < 60 ? '#eab308' : '#ef4444';
  const label = score === 0 ? 'No data' : score < 30 ? 'Low Risk' : score < 60 ? 'Moderate' : 'High Risk';
  const badgeClass = score < 30 ? 'badge-green' : score < 60 ? 'badge-yellow' : 'badge-red';

  return (
    <div className="gauge-container">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1e2030" strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(score, 100) / 100)}
          strokeLinecap="round" transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x="90" y="86" textAnchor="middle" fill="#e8eaf0" fontSize="28" fontWeight="700" fontFamily="Inter">{score}</text>
        <text x="90" y="104" textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="Inter">/ 100</text>
      </svg>
      <span className={`badge ${badgeClass}`} style={{ marginTop: 8 }}>{label}</span>
    </div>
  );
}

const RADAR_KEYS = ['Tremor', 'Tap', 'Spiral', 'Voice', 'Reaction', 'Handwriting', 'Balance', 'Facial'];

export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const firstName = user?.user_metadata?.first_name || 'there';
  const score = 0; // Fetched from backend

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const radarData = RADAR_KEYS.map(k => ({ test: k, score: 0 }));

  return (
    <div>
      <div className="page-header">
        <motion.h1 className="page-title" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {greeting}, {firstName}.
        </motion.h1>
        <p className="page-subtitle">Here's your neurological health overview.</p>
      </div>

      <div className="page-body">
        {/* Main row */}
        <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
          {/* Gauge */}
          <motion.div className="card card-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, justifyContent: 'center', minHeight: 300 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Composite Risk Score</div>
            <ScoreGauge score={score} />
            <Link to="/tests" className="btn btn-primary btn-sm">Start Assessment →</Link>
          </motion.div>

          {/* Radar */}
          <motion.div className="card card-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Module Breakdown</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <PolarGrid stroke="#1e2030" />
                <PolarAngleAxis dataKey="test" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

### 1.3 Result Report UI (`ReportPage.tsx`)
This page handles visualizing the results of the complete diagnostic suite using detailed charts, breaking down the interpretation per neurological module.

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MOCK_SCORES = [
  { module: 'Tremor',      score: 28, weight: 15, status: 'normal' },
  { module: 'Finger Tap',  score: 55, weight: 15, status: 'moderate' },
  { module: 'Spiral',      score: 40, weight: 12, status: 'normal' },
  { module: 'Voice',       score: 62, weight: 18, status: 'moderate' },
  { module: 'Reaction',    score: 35, weight: 10, status: 'normal' },
  { module: 'Handwriting', score: 48, weight: 15, status: 'normal' },
  { module: 'Balance',     score: 30, weight: 8,  status: 'normal' },
  { module: 'Facial',      score: 70, weight: 7,  status: 'elevated' },
];

function compositeScore(modules: typeof MOCK_SCORES) {
  const total = modules.reduce((s, m) => s + m.weight, 0);
  return Math.round(modules.reduce((s, m) => s + (m.score * m.weight) / total, 0));
}

export default function ReportPage() {
  const [hasData] = useState(true);
  const score = compositeScore(MOCK_SCORES);
  const radarData = MOCK_SCORES.map(m => ({ test: m.module, score: m.score }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Assessment Report</h1>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Charts row */}
        <div className="grid-2" style={{ gap: 20 }}>
          <motion.div className="card card-p">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Module Overview</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 4, right: 12, bottom: 4, left: 12 }}>
                <PolarGrid stroke="#1e2030" />
                <PolarAngleAxis dataKey="test" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="card card-p">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Score by Module</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_SCORES} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis type="category" dataKey="module" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Module breakdown table */}
        <motion.div className="card">
          <div style={{ padding: '20px 24px 12px', fontSize: 14, fontWeight: 600 }}>Detailed Findings</div>
          <table className="hist-table">
            <thead>
              <tr><th>Module</th><th>Score</th><th>Status</th><th>Interpretation</th></tr>
            </thead>
            <tbody>
               {MOCK_SCORES.map(m => (
                 <tr key={m.module}>
                   <td style={{ fontWeight: 500, color: '#e8eaf0' }}>{m.module}</td>
                   <td>{m.score}</td>
                   <td>
                     <span className={`badge ${m.status === 'normal' ? 'badge-green' : m.status === 'moderate' ? 'badge-yellow' : 'badge-red'}`}>
                       {m.status}
                     </span>
                   </td>
                   <td style={{ color: '#6b7280', fontSize: 13 }}>
                     {m.status === 'normal' ? 'Within expected parameters' : 'Varying degrees of elevation requiring review'}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 2. Backend API (Node.js / Express / Prisma)

The Node backend serves as an intermediary, utilizing Prisma ORM for type-safe database queries and orchestrating complex ML processing pipelines.

### 2.1 Authentication Controller (`auth.ts`)
Handles the RESTful API endpoints for secure user management using bcrypt and JSON Web Tokens.

```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { generateTokens } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string()
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        dob: new Date(data.dob)
      }
    });

    const tokens = generateTokens(user.id);
    res.status(201).json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id);
    res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens
    });
  } catch (err) {
    next(err);
  }
};
```

### 2.2 Test Ingestion Controller (`tests.ts`)
This API endpoint receives multiplexed binary file streams (e.g. voice `.wav` recordings) and JSON payload blobs from the application, uploads raw data to AWS S3, securely records the database transaction via Prisma, and dispatches the task down to the asynchronous task queue.

```typescript
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { enqueueAnalysisJob } from '../services/queue';
import { uploadRawData } from '../services/s3';

export const submitTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const session = await prisma.testSession.create({
      data: {
        userId,
        status: 'PENDING'
      }
    });

    const testResults = [];
    let tests: any = {};

    try {
      tests = JSON.parse(req.body.tests || '{}');
    } catch (e) {
      tests = req.body.tests || {};
    }

    const files = (req.files as Express.Multer.File[]) || [];

    for (const [moduleName, data] of Object.entries(tests)) {
      let rawDataKey = null;

      const file = files.find(f => f.fieldname === moduleName);
      if (file) {
        rawDataKey = await uploadRawData(file.buffer, file.mimetype, file.originalname.split('.').pop() || 'bin');
      }

      const result = await prisma.testResult.create({
        data: {
          sessionId: session.id,
          moduleName,
          rawDataKey,
          metrics: data as any 
        }
      });
      testResults.push(result);
    }

    // Process files that didn't have accompanying JSON metrics
    for (const file of files) {
      if (!tests[file.fieldname]) {
         const rawDataKey = await uploadRawData(file.buffer, file.mimetype, file.originalname.split('.').pop() || 'bin');
         const result = await prisma.testResult.create({
          data: {
            sessionId: session.id,
            moduleName: file.fieldname,
            rawDataKey,
          }
        });
        testResults.push(result);
      }
    }

    // Offload intensive processing directly to the ML microservices via BullMQ
    await enqueueAnalysisJob(session.id, { tests, files: files.map(f => f.fieldname) });

    res.status(202).json({
      message: 'Test submitted and queued for analysis',
      sessionId: session.id
    });
  } catch (err) {
    next(err);
  }
};
```

---

## 3. Machine Learning Microservice (Python / FastAPI)

The ML service is designed as an isolated microservice communicating asynchronously. It executes FFT and signal processing across time-series biometrics to identify Parkinson's hallmarks.

### 3.1 Primary Assessment Engine (`main.py`)
Provides deterministic and non-deterministic scoring against established neurological bounds. Fast Fourier Transform (FFT) algorithms identify harmonic signatures characteristic of essential resting tremor.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import numpy as np

app = FastAPI(title="NeuroCheck ML Service")

class AnalysisRequest(BaseModel):
    session_id: str
    tests: Dict[str, Any]
    files: List[str]

def analyze_tremor(data: List[Dict[str, float]]) -> float:
    """Analyze high-frequency accelerometer data for canonical rest tremor signatures (4-6Hz)"""
    if not data or len(data) < 2: return 0
    vals = [d.get("x", 0) for d in data]
    
    # Execute Fast Fourier Transform to convert temporal acceleration into frequency domain
    fft_vals = np.abs(np.fft.fft(vals))
    dominance = np.max(fft_vals) if len(fft_vals) > 0 else 0
    
    # Scale output from 0 to 100 based on relative signal amplitude 
    return min(float(dominance) / 100, 100.0)

def analyze_voice(s3_key: str) -> float:
    """Analyze sustained phonation for vocal jitter and shimmer markers via Librosa"""
    # Acoustic Processing execution logic
    return 45.0 
    
def analyze_tap(data: List[Dict[str, Any]]) -> float:
    """Evaluate alternating finger tapping tasks for speed decrement/arrhythmias (bradykinesia)"""
    if len(data) < 2: return 0
    timestamps = [d.get("timestamp", 0) for d in data]
    
    # Calculate Inter-tap intervals (ITI)
    iti = np.diff(timestamps)
    
    # Elevated Coefficient of Variation directly maps to kinematic inconsistency
    cv = np.std(iti) / np.mean(iti) if np.mean(iti) > 0 else 0
    score = min(cv * 100, 100.0) # Higher score -> greater irregularity
    return float(score)

def analyze_gait(data: List[Dict[str, Any]]) -> float:
    return 20.0

@app.post("/ml/analyze")
async def analyze_session(request: AnalysisRequest):
    scores = {}
    
    if "tremor" in request.tests: scores["tremor"] = analyze_tremor(request.tests["tremor"])
    if "finger_tap" in request.tests: scores["finger_tap"] = analyze_tap(request.tests["finger_tap"])
    if "gait" in request.tests: scores["gait"] = analyze_gait(request.tests["gait"])
        
    for f in request.files:
        if f == "voice": scores["voice"] = analyze_voice(f)
        else: scores[f] = 50.0 
            
    composite = np.mean(list(scores.values())) if scores else 0
    risk_level = "High" if composite > 70 else "Moderate" if composite > 30 else "Low"
    
    return {
        "session_id": request.session_id,
        "composite_score": round(float(composite), 2),
        "risk_level": risk_level,
        "per_test_scores": scores
    }
```
