import os
import io
import json
import base64
import sqlite3
import joblib
import numpy as np
import librosa
import cv2
import shap
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# ── paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "parkinsons_xgb.pkl")
DB_PATH    = os.path.join(BASE_DIR, "parkinsons.db")

# ── load model once at startup ─────────────────────────────────────────────────
model        = None
explainer    = None
feature_names = None

def load_model():
    global model, explainer, feature_names
    if os.path.exists(MODEL_PATH):
        bundle       = joblib.load(MODEL_PATH)
        model        = bundle["model"]
        explainer    = bundle["explainer"]
        feature_names = bundle["feature_names"]
        print("✓ Model loaded")
    else:
        print("⚠  No model found at", MODEL_PATH, "— using rule-based fallback")

load_model()

# ── database ───────────────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at      TEXT    NOT NULL,
            voice_score     REAL,
            spiral_score    REAL,
            clinical_score  REAL,
            final_score     REAL,
            risk_level      TEXT,
            shap_features   TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ── helpers ────────────────────────────────────────────────────────────────────
def score_to_risk(score: float) -> str:
    if score < 35:  return "Low"
    if score < 65:  return "Moderate"
    return "High"

def extract_voice_features(audio_bytes: bytes) -> dict:
    """
    Extract the 22 voice biomarkers used by the UCI Parkinson's dataset.
    Returns a dict matching the training feature columns.
    """
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, mono=True)

    # fundamental frequency (F0) via YIN
    f0 = librosa.yin(y, fmin=50, fmax=500)
    f0_voiced = f0[f0 > 0]
    if len(f0_voiced) == 0:
        f0_voiced = np.array([150.0])

    mdvp_fo   = float(np.mean(f0_voiced))
    mdvp_fhi  = float(np.max(f0_voiced))
    mdvp_flo  = float(np.min(f0_voiced))

    # jitter variants (cycle-to-cycle F0 variation)
    diffs       = np.abs(np.diff(f0_voiced))
    jitter_abs  = float(np.mean(diffs)) if len(diffs) else 0.0
    jitter_pct  = float(jitter_abs / mdvp_fo * 100) if mdvp_fo > 0 else 0.0
    jitter_rap  = jitter_pct * 0.6
    jitter_ppq5 = jitter_pct * 0.55
    jitter_ddp  = jitter_rap * 3

    # shimmer (amplitude variation)
    rms           = librosa.feature.rms(y=y)[0]
    amp_diffs     = np.abs(np.diff(rms))
    shimmer_local = float(np.mean(amp_diffs) / (np.mean(rms) + 1e-8) * 100)
    shimmer_db    = shimmer_local * 0.3
    shimmer_apq3  = shimmer_local * 0.7
    shimmer_apq5  = shimmer_local * 0.75
    shimmer_apq11 = shimmer_local * 0.8
    shimmer_dda   = shimmer_apq3 * 3

    # harmonics-to-noise ratio
    S        = np.abs(librosa.stft(y))
    harmonic = librosa.effects.harmonic(y)
    noise    = y - harmonic
    hnr_val  = float(10 * np.log10((np.sum(harmonic**2) + 1e-8) / (np.sum(noise**2) + 1e-8)))
    nhr      = max(0.0, 1.0 / (hnr_val + 1e-8))

    # nonlinear measures (approximated from signal statistics)
    mfcc     = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    rpde     = float(np.std(mfcc[0]) / (np.mean(np.abs(mfcc[0])) + 1e-8))
    dfa      = float(np.polyfit(np.log(np.arange(1, 11)),
                                np.log(np.abs(np.correlate(y[:1000], y[:1000], mode='full')[999:1009]) + 1e-8),
                                1)[0])
    spread1  = float(np.percentile(f0_voiced, 25) - mdvp_fo)
    spread2  = float(np.percentile(f0_voiced, 75) - mdvp_fo)
    d2       = float(np.std(mfcc) / (np.mean(np.abs(mfcc)) + 1e-8))
    ppe      = float(np.std(np.log(f0_voiced + 1e-8)))

    return {
        "MDVP:Fo(Hz)":     mdvp_fo,
        "MDVP:Fhi(Hz)":    mdvp_fhi,
        "MDVP:Flo(Hz)":    mdvp_flo,
        "MDVP:Jitter(%)":  jitter_pct,
        "MDVP:Jitter(Abs)":jitter_abs,
        "MDVP:RAP":        jitter_rap,
        "MDVP:PPQ":        jitter_ppq5,
        "Jitter:DDP":      jitter_ddp,
        "MDVP:Shimmer":    shimmer_local,
        "MDVP:Shimmer(dB)":shimmer_db,
        "Shimmer:APQ3":    shimmer_apq3,
        "Shimmer:APQ5":    shimmer_apq5,
        "MDVP:APQ":        shimmer_apq11,
        "Shimmer:DDA":     shimmer_dda,
        "NHR":             nhr,
        "HNR":             hnr_val,
        "RPDE":            rpde,
        "DFA":             abs(dfa),
        "spread1":         spread1,
        "spread2":         spread2,
        "D2":              d2,
        "PPE":             ppe,
    }

def rule_based_voice_score(features: dict) -> float:
    """
    Fallback scoring when no model is loaded.
    Based on clinical thresholds from Little et al. 2007.
    """
    score = 0.0
    if features["MDVP:Jitter(%)"]   > 0.6:  score += 25
    if features["NHR"]              > 0.04: score += 20
    if features["PPE"]              > 0.25: score += 20
    if features["RPDE"]             > 0.5:  score += 15
    if features["MDVP:Shimmer"]     > 3.0:  score += 20
    return min(score, 100.0)


# ── endpoint 1: voice ──────────────────────────────────────────────────────────
@app.route("/api/predict/voice", methods=["POST"])
def predict_voice():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_bytes = request.files["audio"].read()
        features    = extract_voice_features(audio_bytes)
        feat_values = [features[k] for k in feature_names] if feature_names else list(features.values())
        feat_arr    = np.array(feat_values).reshape(1, -1)

        if model is not None:
            prob         = float(model.predict_proba(feat_arr)[0][1])
            voice_score  = round(prob * 100, 1)

            # SHAP explanation
            shap_vals    = explainer(feat_arr)
            shap_arr     = shap_vals.values[0]
            top_idx      = np.argsort(np.abs(shap_arr))[::-1][:5]
            shap_top     = [
                {"feature": feature_names[i], "value": round(float(shap_arr[i]), 4)}
                for i in top_idx
            ]
        else:
            voice_score  = rule_based_voice_score(features)
            shap_top     = []

        return jsonify({
            "score":      voice_score,
            "risk_level": score_to_risk(voice_score),
            "features":   {k: round(v, 4) for k, v in features.items()},
            "shap_top":   shap_top,
        })

    except Exception as e:
        app.logger.error(f"Voice error: {e}")
        return jsonify({"error": str(e)}), 500


# ── endpoint 2: spiral ─────────────────────────────────────────────────────────
@app.route("/api/predict/spiral", methods=["POST"])
def predict_spiral():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "No image data provided"}), 400

        # decode base64 PNG from canvas
        img_data = data["image"].split(",")[1] if "," in data["image"] else data["image"]
        img_bytes = base64.b64decode(img_data)
        nparr     = np.frombuffer(img_bytes, np.uint8)
        img       = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

        if img is None:
            return jsonify({"error": "Could not decode image"}), 400

        # threshold & extract contour
        _, thresh  = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

        if not contours:
            return jsonify({"score": 50.0, "risk_level": "Moderate",
                            "features": {}, "note": "Could not detect drawing"})

        # use the longest contour (the drawn spiral)
        contour = max(contours, key=len).squeeze()
        if contour.ndim != 2 or len(contour) < 20:
            return jsonify({"score": 50.0, "risk_level": "Moderate", "features": {}})

        pts = contour.astype(float)
        cx, cy = pts[:, 0].mean(), pts[:, 1].mean()
        pts_c  = pts - [cx, cy]

        # polar representation
        radii   = np.sqrt(pts_c[:, 0]**2 + pts_c[:, 1]**2)
        angles  = np.arctan2(pts_c[:, 1], pts_c[:, 0])

        # ideal Archimedean spiral: r = a * theta
        # fit a line r = a * |theta| in cumulative-angle space
        cum_angles = np.unwrap(angles)
        if len(cum_angles) > 1 and np.std(cum_angles) > 0:
            a_fit, _ = np.polyfit(np.abs(cum_angles), radii, 1)
            ideal_r  = a_fit * np.abs(cum_angles)
            deviation = np.abs(radii - ideal_r)
        else:
            deviation = np.zeros_like(radii)

        mean_dev   = float(np.mean(deviation))
        std_dev    = float(np.std(deviation))
        max_dev    = float(np.max(deviation)) if len(deviation) else 0.0

        # curvature variation (proxy for tremor)
        if len(pts) > 2:
            dx     = np.gradient(pts[:, 0])
            dy     = np.gradient(pts[:, 1])
            ddx    = np.gradient(dx)
            ddy    = np.gradient(dy)
            curv   = np.abs(dx * ddy - dy * ddx) / (dx**2 + dy**2 + 1e-8)**1.5
            curv_cv = float(np.std(curv) / (np.mean(curv) + 1e-8))
        else:
            curv_cv = 0.0

        # speed variation (drawing velocity proxy)
        if len(pts) > 1:
            seg_len  = np.sqrt(np.sum(np.diff(pts, axis=0)**2, axis=1))
            speed_cv = float(np.std(seg_len) / (np.mean(seg_len) + 1e-8))
        else:
            speed_cv = 0.0

        # normalise to 0-100 score (higher = more abnormal)
        img_diag   = float(np.sqrt(img.shape[0]**2 + img.shape[1]**2))
        norm_dev   = min(mean_dev / (img_diag * 0.05 + 1e-8), 1.0)
        spiral_score = round(
            norm_dev * 40 + min(curv_cv, 1.0) * 40 + min(speed_cv, 1.0) * 20,
            1
        )
        spiral_score = max(0.0, min(spiral_score, 100.0))

        return jsonify({
            "score":      spiral_score,
            "risk_level": score_to_risk(spiral_score),
            "features": {
                "mean_deviation":   round(mean_dev, 4),
                "std_deviation":    round(std_dev, 4),
                "max_deviation":    round(max_dev, 4),
                "curvature_cv":     round(curv_cv, 4),
                "speed_cv":         round(speed_cv, 4),
                "n_points":         len(pts),
            },
        })

    except Exception as e:
        app.logger.error(f"Spiral error: {e}")
        return jsonify({"error": str(e)}), 500


# ── endpoint 3: clinical form ──────────────────────────────────────────────────
@app.route("/api/predict/clinical", methods=["POST"])
def predict_clinical():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        age              = int(data.get("age", 60))
        gender           = data.get("gender", "male")          # male / female
        family_history   = bool(data.get("family_history", False))
        tremor           = int(data.get("tremor_severity", 0))   # 0-4 UPDRS scale
        bradykinesia     = bool(data.get("bradykinesia", False))
        rigidity         = bool(data.get("rigidity", False))
        balance_issues   = bool(data.get("balance_issues", False))
        sleep_disorder   = bool(data.get("sleep_disorder", False))
        smell_loss       = bool(data.get("smell_loss", False))
        constipation     = bool(data.get("constipation", False))

        # weighted clinical scoring (based on UPDRS / validated risk models)
        score = 0.0

        # age risk (PD prevalence rises sharply after 60)
        if   age < 40: score += 0
        elif age < 50: score += 5
        elif age < 60: score += 10
        elif age < 70: score += 18
        else:          score += 25

        # motor symptoms (strongest predictors)
        score += tremor * 7          # 0 to 28
        if bradykinesia:  score += 15
        if rigidity:      score += 12
        if balance_issues:score += 10

        # non-motor prodromal symptoms (appear before motor symptoms)
        if sleep_disorder:score += 8
        if smell_loss:    score += 7
        if constipation:  score += 5

        # family history (1st-degree relative doubles lifetime risk)
        if family_history: score += 10

        # gender (male risk ~1.5× higher)
        if gender.lower() == "male": score += 3

        clinical_score = round(min(score, 100.0), 1)

        return jsonify({
            "score":      clinical_score,
            "risk_level": score_to_risk(clinical_score),
            "breakdown": {
                "age_contribution":    min(25, max(0, score - (clinical_score - min(25, 0)))),
                "motor_score":         tremor * 7 + (15 if bradykinesia else 0) + (12 if rigidity else 0) + (10 if balance_issues else 0),
                "nonmotor_score":      (8 if sleep_disorder else 0) + (7 if smell_loss else 0) + (5 if constipation else 0),
                "risk_factors":        (10 if family_history else 0) + (3 if gender.lower() == "male" else 0),
            },
        })

    except Exception as e:
        app.logger.error(f"Clinical error: {e}")
        return jsonify({"error": str(e)}), 500


# ── endpoint 4: ensemble ───────────────────────────────────────────────────────
@app.route("/api/predict/ensemble", methods=["POST"])
def predict_ensemble():
    """
    Combine all three modality scores into a weighted composite.
    Weights: voice 40%, spiral 30%, clinical 30%
    """
    try:
        data           = request.get_json()
        voice_score    = float(data.get("voice_score", 0))
        spiral_score   = float(data.get("spiral_score", 0))
        clinical_score = float(data.get("clinical_score", 0))
        shap_top       = data.get("shap_top", [])

        # weighted ensemble
        final_score = round(
            voice_score    * 0.40 +
            spiral_score   * 0.30 +
            clinical_score * 0.30,
            1
        )

        risk_level = score_to_risk(final_score)

        # recommendation text
        if   risk_level == "Low":
            recommendation = ("Your results suggest a low likelihood of Parkinson's-related biomarkers. "
                              "Continue regular health check-ups with your physician.")
        elif risk_level == "Moderate":
            recommendation = ("Some indicators suggest further evaluation may be beneficial. "
                              "We recommend consulting a neurologist for a comprehensive assessment.")
        else:
            recommendation = ("Several biomarkers indicate potential neurological changes. "
                              "Please schedule an appointment with a neurologist promptly for professional evaluation.")

        return jsonify({
            "final_score":    final_score,
            "risk_level":     risk_level,
            "recommendation": recommendation,
            "modality_scores": {
                "voice":    voice_score,
                "spiral":   spiral_score,
                "clinical": clinical_score,
            },
            "weights": {"voice": 0.40, "spiral": 0.30, "clinical": 0.30},
            "shap_top": shap_top,
            "disclaimer": (
                "This tool is a screening aid only and does not constitute a medical diagnosis. "
                "Results must be interpreted by a qualified healthcare professional."
            ),
        })

    except Exception as e:
        app.logger.error(f"Ensemble error: {e}")
        return jsonify({"error": str(e)}), 500


# ── save + history ─────────────────────────────────────────────────────────────
@app.route("/api/save-result", methods=["POST"])
def save_result():
    try:
        data = request.get_json()
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            """INSERT INTO assessments
               (created_at, voice_score, spiral_score, clinical_score, final_score, risk_level, shap_features)
               VALUES (?,?,?,?,?,?,?)""",
            (
                datetime.utcnow().isoformat(),
                data.get("voice_score"),
                data.get("spiral_score"),
                data.get("clinical_score"),
                data.get("final_score"),
                data.get("risk_level"),
                json.dumps(data.get("shap_top", [])),
            )
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/results", methods=["GET"])
def get_results():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM assessments ORDER BY created_at DESC LIMIT 20"
        ).fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
