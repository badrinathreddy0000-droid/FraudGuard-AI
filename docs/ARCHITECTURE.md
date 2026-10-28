# FraudGuard AI — System Architecture

FraudGuard AI is an enterprise financial fraud detection and risk scoring platform built directly upon the research findings of the **IEEE-CIS Fraud Detection Modeling** benchmark.

```mermaid
flowchart TD
    Client["Client / Analyst Browser (React 18 + Vite + Tailwind)"] -->|REST API / JWT| Gateway["FastAPI Server (:8000)"]
    Gateway --> Auth["JWT Auth & RBAC (Admin, Analyst, Auditor)"]
    Gateway --> Arbiter["Fraud Arbiter Engine"]
    
    subgraph Detection Layer
        Arbiter --> RuleEng["Heuristic Rules Engine (Configurable Safety Rails)"]
        Arbiter --> MLInference["LightGBM Model Inference (<15ms)"]
        MLInference --> Preproc["IEEE-CIS Preprocessor & Category Encoder"]
        MLInference --> Explain["Local Attribution & Risk Drivers"]
    end

    subgraph Data & Persistence
        Arbiter --> SQLite[("SQLite Database (fraudguard.db)")]
        SQLite --> TxTable["Transactions & Triage Status"]
        SQLite --> BenchmarkTable["Notebook Benchmark Metrics"]
        SQLite --> RulesTable["Security Rules & Thresholds"]
        SQLite --> AuditTable["Compliance Audit Logs"]
    end
```

## Core Components
1. **Frontend (Vite + React 18 + Tailwind CSS + Lucide Icons + Recharts)**:
   - Real-time Operations Dashboard with live telemetry stream and volume graphs.
   - Interactive Live Inspector with 4 preset scenario benchmarks (e.g. Micro-charge testing, ATO).
   - Bulk Batch CSV evaluation engine with downloadable sample templates.
   - Model Research Lab directly comparing the 4 notebook methods under chronological split vs CV.
   - Investigation Ledger with analyst decision overrides (Confirm Fraud, False Positive, Dismiss).
   - Rules Engine & Risk Threshold calibration sliders.

2. **Backend (FastAPI + SQLAlchemy + Pydantic v2 + Scikit-Learn + LightGBM)**:
   - High-throughput asynchronous REST API (<15ms scoring latency).
   - Hybrid decision engine: combines rule-based deterministic safety rails with probabilistic ML scoring.
   - Local feature attribution engine (SHAP-approximated impact) providing actionable explanations for every alert.
   - Database auto-seeding with exact benchmark results extracted from `IEEE_CIS_Fraud_Detection_Modeling.ipynb`.
