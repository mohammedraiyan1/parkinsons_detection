import os
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import shap

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing   import StandardScaler
from sklearn.metrics         import (accuracy_score, classification_report,
                                     confusion_matrix, roc_auc_score, roc_curve)
from sklearn.svm             import SVC
from sklearn.ensemble        import RandomForestClassifier
from xgboost                 import XGBClassifier
from imblearn.over_sampling  import SMOTE

# ── 1. Load dataset ────────────────────────────────────────────────────────────
DATA_PATH  = "/content/parkinsons.data.csv"  # Corrected path for Colab
MODEL_DIR  = "models"  # Create models directory in current working directory
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs("plots", exist_ok=True)

print("=" * 60)
print("  Parkinson's Detection — Model Training")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\n✓ Loaded dataset: {df.shape[0]} samples, {df.shape[1]} columns")
print(f"  Class distribution:\n{df['status'].value_counts().to_string()}")

# drop the name column (not a feature)
df = df.drop(columns=["name"], errors="ignore")

# ── 2. Features & target ───────────────────────────────────────────────────────
FEATURE_COLS = [c for c in df.columns if c != "status"]
X = df[FEATURE_COLS].values
y = df["status"].values          # 1 = Parkinson's, 0 = Healthy

print(f"\n✓ Features ({len(FEATURE_COLS)}): {FEATURE_COLS}")

# ── 3. Train / test split ──────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── 4. SMOTE — oversample minority class (healthy) ────────────────────────────
print(f"\n  Before SMOTE: {dict(zip(*np.unique(y_train, return_counts=True)))}")
sm = SMOTE(random_state=42)
X_train_sm, y_train_sm = sm.fit_resample(X_train, y_train)
print(f"  After  SMOTE: {dict(zip(*np.unique(y_train_sm, return_counts=True)))}")

# ── 5. Scale features ─────────────────────────────────────────────────────────
scaler     = StandardScaler()
X_train_sc = scaler.fit_transform(X_train_sm)
X_test_sc  = scaler.transform(X_test)

# ── 6. Train multiple models for comparison ────────────────────────────────────
print("\n  Training models...")

models = {
    "XGBoost": XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        max_depth=6,
        random_state=42,
        n_jobs=-1,
    ),
    "SVM": SVC(
        kernel="rbf",
        C=10,
        gamma="scale",
        probability=True,
        random_state=42,
    ),
}

results = {}
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for name, clf in models.items():
    clf.fit(X_train_sc, y_train_sm)
    cv_scores = cross_val_score(clf, X_train_sc, y_train_sm, cv=cv, scoring="accuracy")
    y_pred    = clf.predict(X_test_sc)
    y_prob    = clf.predict_proba(X_test_sc)[:, 1]
    acc       = accuracy_score(y_test, y_pred)
    auc       = roc_auc_score(y_test, y_prob)
    results[name] = {"model": clf, "acc": acc, "auc": auc,
                     "cv_mean": cv_scores.mean(), "cv_std": cv_scores.std(),
                     "y_pred": y_pred, "y_prob": y_prob}
    print(f"  {name:20s}  acc={acc:.4f}  AUC={auc:.4f}  cv={cv_scores.mean():.4f}±{cv_scores.std():.4f}")

# ── 7. Pick best model ─────────────────────────────────────────────────────────
best_name  = max(results, key=lambda k: results[k]["auc"])
best       = results[best_name]
best_clf   = best["model"]
print(f"\n✓ Best model: {best_name}  (AUC={best['auc']:.4f})")

# ── 8. Detailed report on best model ──────────────────────────────────────────
print(f"\n  Classification Report ({best_name}):")
print(classification_report(y_test, best["y_pred"],
                             target_names=["Healthy", "Parkinson's"]))

# ── 9. SHAP explainability ────────────────────────────────────────────────────
print("\n  Computing SHAP values...")
if best_name == "XGBoost":
    explainer  = shap.TreeExplainer(best_clf)
else:
    explainer  = shap.KernelExplainer(best_clf.predict_proba, X_train_sc[:50])

shap_vals  = explainer(X_test_sc)
# for multi-output shap: take Parkinson's class
if hasattr(shap_vals, "values") and shap_vals.values.ndim == 3:
    shap_arr = shap_vals.values[:, :, 1]
else:
    shap_arr = shap_vals.values

mean_abs_shap = np.abs(shap_arr).mean(axis=0)
shap_df = pd.DataFrame({
    "feature":    FEATURE_COLS,
    "importance": mean_abs_shap,
}).sort_values("importance", ascending=False)

print("\n  Top 10 SHAP features:")
print(shap_df.head(10).to_string(index=False))

# ── 10. Save plots ─────────────────────────────────────────────────────────────
# Confusion matrix
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

cm = confusion_matrix(y_test, best["y_pred"])
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=axes[0],
            xticklabels=["Healthy", "Parkinson's"],
            yticklabels=["Healthy", "Parkinson's"])
axes[0].set_title(f"Confusion Matrix ({best_name})", fontsize=13)
axes[0].set_ylabel("True Label")
axes[0].set_xlabel("Predicted Label")

# ROC curve (all models)
for name, res in results.items():
    fpr, tpr, _ = roc_curve(y_test, res["y_prob"])
    axes[1].plot(fpr, tpr, label=f"{name} (AUC={res['auc']:.3f})", linewidth=2)
axes[1].plot([0, 1], [0, 1], "k--", alpha=0.4)
axes[1].set_title("ROC Curves — All Models", fontsize=13)
axes[1].set_xlabel("False Positive Rate")
axes[1].set_ylabel("True Positive Rate")
axes[1].legend()

# SHAP bar chart
axes[2].barh(shap_df["feature"][:12][::-1], shap_df["importance"][:12][::-1],
             color="#7F77DD", edgecolor="none")
axes[2].set_title("SHAP Feature Importance", fontsize=13)
axes[2].set_xlabel("Mean |SHAP value|")

plt.tight_layout()
plt.savefig("plots/model_evaluation.png", dpi=150, bbox_inches="tight")
print("\n✓ Saved plots/model_evaluation.png")

# SHAP summary plot
plt.figure(figsize=(10, 6))
shap.summary_plot(shap_arr, X_test_sc, feature_names=FEATURE_COLS,
                  show=False, plot_size=(10, 6))
plt.title("SHAP Summary — Feature Impact on Parkinson's Prediction")
plt.tight_layout()
plt.savefig("plots/shap_summary.png", dpi=150, bbox_inches="tight")
plt.close("all")
print("✓ Saved plots/shap_summary.png")

# ── 11. Model comparison table ─────────────────────────────────────────────────
print("\n  Final Model Comparison Table:")
print(f"  {'Model':<20} {'Accuracy':>10} {'AUC':>8} {'CV Mean':>10} {'CV Std':>8}")
print("  " + "-" * 60)
for name, res in results.items():
    marker = " ◀ selected" if name == best_name else ""
    print(f"  {name:<20} {res['acc']:>10.4f} {res['auc']:>8.4f} "
          f"{res['cv_mean']:>10.4f} {res['cv_std']:>8.4f}{marker}")

# ── 12. Save model bundle ──────────────────────────────────────────────────────
bundle = {
    "model":         best_clf,
    "scaler":        scaler,
    "explainer":     explainer,
    "feature_names": FEATURE_COLS,
    "best_model_name": best_name,
    "metrics": {
        "accuracy": round(best["acc"], 4),
        "auc":      round(best["auc"], 4),
        "cv_mean":  round(best["cv_mean"], 4),
        "cv_std":   round(best["cv_std"], 4),
    },
    "shap_importance": shap_df.to_dict(orient="records"),
}

save_path = os.path.join(MODEL_DIR, "parkinsons_xgb.pkl")
joblib.dump(bundle, save_path)
print(f"\n✓ Model bundle saved → {save_path}")
print("\n  Done! Run `python app.py` to start the backend.\n")