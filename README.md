# FraudGuard AI — Real-Time Financial Fraud Detection Platform

FraudGuard AI is a production-grade machine learning platform for real-time credit card and electronic transaction fraud detection, directly operationalizing the research conducted in `notebooks/IEEE_CIS_Fraud_Detection_Modeling.ipynb`.

---

## 🌟 Key Capabilities
- **Real-Time Transaction Scoring**: Sub-15ms inference latency scoring single transactions against calibrated LightGBM models.
- **Explainable AI (XAI)**: Generates local feature attributions showing why each transaction was flagged (e.g., velocity burst C1, abnormal transaction amounts, disposable email domains, billing distance disparity).
- **Hybrid Arbiter Engine**: Combines deterministic heuristic security rules (e.g., high-value auto-block) with probabilistic machine learning risk scores.
- **Bulk CSV Batch Evaluation**: Evaluates high-volume transaction CSV files with real-time throughput metrics, ROI savings calculation, and downloadable reports.
- **Model Research Lab**: Direct side-by-side comparison of the 4 class imbalance methods evaluated in the research notebook under both Chronological 70/30 split and 5-Fold Cross Validation.
- **Analyst Triage & Audit Ledger**: Review flagged transactions, log investigator notes, and mark false positives or confirmed fraud.

---

## 📊 Notebook Benchmark Findings (IEEE-CIS)

| Method | Evaluation Split | PR-AUC | Precision | Recall | F1 Score | F2 Score | MCC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Class-weighted LightGBM** ⭐ | **Chronological 70/30** | **0.5279** | 0.2784 | **0.6612** | 0.3918 | **0.5186** | 0.3992 |
| **Baseline LightGBM** | Chronological 70/30 | 0.5239 | **0.7549** | 0.3435 | 0.4722 | 0.3855 | 0.4985 |
| **SMOTENC (50% Pilot)** 🏆 | Chronological 70/30 | 0.5209 | 0.7521 | 0.3572 | **0.4844** | 0.3991 | **0.5075** |
| **Random Undersampling** | Chronological 70/30 | 0.4844 | 0.1988 | **0.7265** | 0.3122 | 0.4746 | 0.3419 |
| **Baseline LightGBM** | Randomized 5-fold CV | **0.7109** | **0.9171** | 0.4673 | **0.6190** | 0.5181 | **0.6467** |
| **Class-weighted LightGBM** | Randomized 5-fold CV | 0.6696 | 0.2830 | 0.8097 | 0.4194 | **0.5901** | 0.4502 |
| **SMOTENC (50% Pilot)** | Randomized 5-fold CV | 0.6527 | 0.8758 | 0.4320 | 0.5785 | 0.4807 | 0.6063 |
| **Random Undersampling** | Randomized 5-fold CV | 0.5608 | 0.1809 | **0.8202** | 0.2964 | 0.4805 | 0.3448 |

> ⭐ **PR-AUC Champion (Chronological)**: Class-weighted LightGBM (0.5279)  
> 🏆 **F1 & MCC Champion (Chronological)**: SMOTENC (F1: 0.4844, MCC: 0.5075)  
> ⚠️ **Temporal Leakage Finding**: Baseline PR-AUC drops from 0.7109 in random CV to 0.5239 in chronological split due to concept drift in time-series transaction data.

---

## 🚀 Quick Start Guide

### 1. Start Backend API
```powershell
cd "C:\Users\badri\Desktop\FraudGuard-AI\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Endpoint: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

### 2. Start Frontend UI
```powershell
cd "C:\Users\badri\Desktop\FraudGuard-AI\frontend"
npm run dev
```
- Web Application: `http://localhost:5173`

### 3. Run Automated Tests
```powershell
cd "C:\Users\badri\Desktop\FraudGuard-AI\backend"
.\venv\Scripts\pytest.exe tests -v
```

---

## 📁 Project Structure
```text
FraudGuard-AI/
├── frontend/                     # React 18 + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/           # Sidebar, Navbar, StatCard, RiskDial, TransactionModal
│   │   ├── pages/                # Dashboard, Predict, Batch, ModelLab, Transactions, Rules, SystemStatus
│   │   ├── services/             # Axios API Client
│   │   ├── App.jsx               # Navigation & Global State
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                      # FastAPI Python Service
│   ├── app/
│   │   ├── api/                  # Predict, Batch, Transactions, Models, Rules, Analytics, System
│   │   ├── auth/                 # JWT Auth & RBAC
│   │   ├── core/                 # App Settings & Bcrypt Security
│   │   ├── database/             # SQLite, Models, Session & Notebook Seeds
│   │   ├── ml/                   # IEEE Preprocessor, Feature Schema, Model Manager, Trainer
│   │   ├── services/             # Fraud Arbiter, Rules Engine, Batch Service, Analytics
│   │   └── main.py               # FastAPI App & Lifecycle
│   ├── tests/                    # Pytest Suite (8 Passing Unit/Integration Tests)
│   ├── requirements.txt
│   └── fraudguard.db             # Local SQLite Database
├── notebooks/
│   └── IEEE_CIS_Fraud_Detection_Modeling.ipynb  # Preserved Original Research Notebook
├── data/
│   └── README.md                 # Kaggle Dataset Placement & Path Instructions
├── artifacts/
│   ├── README.md                 # Model Artifacts Documentation
│   └── fraudguard_lightgbm.joblib# Serialized Calibrated LightGBM Model
├── docs/
│   ├── ARCHITECTURE.md           # System Diagrams & Technical Specification
│   └── RUNBOOK.md                # Deployment & Operations Manual
├── .gitignore
└── README.md
```

---

## 🔑 Default Credentials
- **Admin**: `admin@fraudguard.ai` / `Admin@123`
- **Analyst**: `analyst@fraudguard.ai` / `Analyst@123`
- **Auditor**: `auditor@fraudguard.ai` / `Auditor@123`
