from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import ModelBenchmark, SystemSetting, AuditLog, User
from app.auth.dependencies import get_current_user
from app.ml.model_manager import model_manager
from app.ml.trainer import train_fraud_model

router = APIRouter(prefix="/models", tags=["Model Research & Benchmarks"])

class ActiveModelUpdate(BaseModel):
    model_name: str

@router.get("/benchmarks")
def get_model_benchmarks(db: Session = Depends(get_db)):
    """Returns the IEEE-CIS benchmark results from the research notebook."""
    benchmarks = db.query(ModelBenchmark).order_by(ModelBenchmark.id.asc()).all()
    results = []
    for b in benchmarks:
        results.append({
            "id": b.id,
            "method_name": b.method_name,
            "evaluation_type": b.evaluation_type,
            "pr_auc": b.pr_auc,
            "precision": b.precision,
            "recall": b.recall,
            "f1": b.f1,
            "f2": b.f2,
            "mcc": b.mcc,
            "description": b.description
        })
    return results

@router.get("/curves")
def get_performance_curves():
    """Returns Precision-Recall curve coordinate data for comparing the 4 research methods."""
    # Synthetic PR curve coordinate samples representing the notebook curves
    recalls = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

    baseline_prec = [0.92, 0.88, 0.82, 0.75, 0.62, 0.48, 0.32, 0.18, 0.08, 0.035]
    weighted_prec = [0.78, 0.72, 0.68, 0.62, 0.56, 0.50, 0.42, 0.31, 0.18, 0.035]
    smote_prec    = [0.85, 0.80, 0.76, 0.71, 0.60, 0.52, 0.38, 0.22, 0.10, 0.035]
    under_prec    = [0.65, 0.58, 0.52, 0.46, 0.41, 0.36, 0.30, 0.24, 0.14, 0.035]

    data = []
    for i, r in enumerate(recalls):
        data.append({
            "recall": r,
            "Baseline": baseline_prec[i],
            "Class-Weighted": weighted_prec[i],
            "SMOTENC": smote_prec[i],
            "Undersampling": under_prec[i]
        })
    return data

@router.get("/active")
def get_active_model(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "active_model").first()
    active_name = setting.value if setting else model_manager.active_model_name
    return {
        "active_model": active_name,
        "available_models": [
            "Baseline LightGBM",
            "Class-weighted LightGBM",
            "SMOTENC (50% Pilot)",
            "Random Undersampling"
        ],
        "champion_status": {
            "chronological_pr_auc_champion": "Class-weighted LightGBM (0.5279)",
            "chronological_f1_champion": "SMOTENC (0.4844)",
            "highest_recall": "Random Undersampling (0.7265)",
            "highest_precision": "Baseline LightGBM (0.7549)"
        }
    }

@router.post("/active")
def set_active_model(
    payload: ActiveModelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "active_model").first()
    if not setting:
        setting = SystemSetting(key="active_model", value=payload.model_name)
        db.add(setting)
    else:
        setting.value = payload.model_name

    model_manager.active_model_name = payload.model_name

    db.add(AuditLog(
        user_email=current_user.email,
        action="SWITCH_ACTIVE_MODEL",
        entity_type="SYSTEM",
        entity_id="ACTIVE_MODEL",
        details=f"Active scoring model changed to: {payload.model_name}"
    ))
    db.commit()

    return {"status": "success", "active_model": payload.model_name}

@router.post("/train")
def trigger_training(
    background_tasks: BackgroundTasks,
    method: str = "class_weighted",
    current_user: User = Depends(get_current_user)
):
    """Triggers background model training if train_transaction.csv is placed in data/."""
    from app.core.config import settings
    if not settings.TRAIN_TRANSACTION_PATH.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Dataset not found at {settings.TRAIN_TRANSACTION_PATH}. Please copy train_transaction.csv to data/."
        )

    background_tasks.add_task(train_fraud_model, method=method)
    return {
        "status": "started",
        "message": f"Training job ({method}) initiated in background. Check artifacts/ upon completion."
    }
