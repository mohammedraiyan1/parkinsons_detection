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
    if not data or len(data) < 2: return 0
    vals = [d.get("x", 0) for d in data]
    fft_vals = np.abs(np.fft.fft(vals))
    dominance = np.max(fft_vals) if len(fft_vals) > 0 else 0
    return min(float(dominance) / 100, 100.0)

def analyze_voice(s3_key: str) -> float:
    # Here we would download from S3 and:
    # import librosa
    # y, sr = librosa.load(...)
    # mfcc = librosa.feature.mfcc(y=y, sr=sr)
    return 45.0 # Dummy score for voice
    
def analyze_tap(data: List[Dict[str, Any]]) -> float:
    if len(data) < 2: return 0
    timestamps = [d.get("timestamp", 0) for d in data]
    # Calculate Inter-tap intervals (ITI)
    iti = np.diff(timestamps)
    cv = np.std(iti) / np.mean(iti) if np.mean(iti) > 0 else 0
    score = min(cv * 100, 100.0) # High cv -> high irregularity -> higher risk
    return float(score)

def analyze_gait(data: List[Dict[str, Any]]) -> float:
    # Cadence and symmetry
    return 20.0

@app.post("/ml/analyze")
async def analyze_session(request: AnalysisRequest):
    scores = {}
    
    if "tremor" in request.tests: scores["tremor"] = analyze_tremor(request.tests["tremor"])
    if "finger_tap" in request.tests: scores["finger_tap"] = analyze_tap(request.tests["finger_tap"])
    if "gait" in request.tests: scores["gait"] = analyze_gait(request.tests["gait"])
        
    for f in request.files:
        if f == "voice": scores["voice"] = analyze_voice("s3_key_mock")
        else: scores[f] = 50.0 
            
    composite = np.mean(list(scores.values())) if scores else 0
    risk_level = "High" if composite > 70 else "Moderate" if composite > 30 else "Low"
    
    return {
        "session_id": request.session_id,
        "composite_score": round(float(composite), 2),
        "risk_level": risk_level,
        "per_test_scores": scores
    }
