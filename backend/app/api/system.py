import os
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import TransactionRecord, User, FraudRule, ModelBenchmark
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System Verification"])

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    """Verifies project environment, paths, notebook presence, and datasets."""
    notebook_path = settings.NOTEBOOKS_DIR / "IEEE_CIS_Fraud_Detection_Modeling.ipynb"
    train_csv_path = settings.DATA_DIR / "train_transaction.csv"
    identity_csv_path = settings.DATA_DIR / "train_identity.csv"
    model_artifact = settings.ARTIFACTS_DIR / "fraudguard_lightgbm.joblib"

    return {
        "status": "HEALTHY",
        "version": settings.VERSION,
        "verification_checklist": {
            "notebook_copied": {
                "verified": notebook_path.exists(),
                "path": str(notebook_path),
                "size_kb": round(notebook_path.stat().st_size / 1024, 1) if notebook_path.exists() else 0
            },
            "raw_dataset_present": {
                "verified": train_csv_path.exists(),
                "path": str(train_csv_path),
                "instruction": "Optional: Place Kaggle 'train_transaction.csv' into 'data/' to retrain models locally on full 590K rows."
            },
            "identity_dataset_present": {
                "verified": identity_csv_path.exists(),
                "path": str(identity_csv_path)
            },
            "model_artifacts": {
                "verified": model_artifact.exists(),
                "path": str(model_artifact),
                "status": "Ready for live inference"
            }
        },
        "database_records": {
            "transactions_count": db.query(TransactionRecord).count(),
            "rules_count": db.query(FraudRule).count(),
            "benchmarks_count": db.query(ModelBenchmark).count(),
            "users_count": db.query(User).count()
        }
    }
