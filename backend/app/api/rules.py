from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import FraudRule, SystemSetting, AuditLog, User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/rules", tags=["Rules & Thresholds"])

class RuleCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    field: str
    operator: str
    threshold_value: str
    action: str = "REVIEW"
    is_active: bool = True

class RuleResponse(BaseModel):
    id: int
    name: str
    description: str
    field: str
    operator: str
    threshold_value: str
    action: str
    is_active: bool

    class Config:
        from_attributes = True

class ThresholdUpdate(BaseModel):
    allow_threshold: float
    review_threshold: float

@router.get("", response_model=List[RuleResponse])
def list_rules(db: Session = Depends(get_db)):
    rules = db.query(FraudRule).order_by(FraudRule.id.asc()).all()
    return rules

@router.post("", response_model=RuleResponse)
def create_rule(
    payload: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = FraudRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.patch("/{rule_id}/toggle")
def toggle_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(FraudRule).filter(FraudRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    return {"status": "success", "id": rule.id, "is_active": rule.is_active}

@router.delete("/{rule_id}")
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(FraudRule).filter(FraudRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"status": "deleted", "id": rule_id}

@router.get("/thresholds")
def get_thresholds(db: Session = Depends(get_db)):
    allow_s = db.query(SystemSetting).filter(SystemSetting.key == "allow_threshold").first()
    review_s = db.query(SystemSetting).filter(SystemSetting.key == "review_threshold").first()
    return {
        "allow_threshold": float(allow_s.value) if allow_s else 0.35,
        "review_threshold": float(review_s.value) if review_s else 0.70
    }

@router.post("/thresholds")
def update_thresholds(
    payload: ThresholdUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not (0.0 <= payload.allow_threshold <= payload.review_threshold <= 1.0):
        raise HTTPException(status_code=400, detail="Thresholds must satisfy: 0.0 <= allow <= review <= 1.0")

    allow_s = db.query(SystemSetting).filter(SystemSetting.key == "allow_threshold").first()
    review_s = db.query(SystemSetting).filter(SystemSetting.key == "review_threshold").first()

    if allow_s:
        allow_s.value = str(payload.allow_threshold)
    if review_s:
        review_s.value = str(payload.review_threshold)

    db.add(AuditLog(
        user_email=current_user.email,
        action="UPDATE_THRESHOLDS",
        entity_type="SYSTEM",
        entity_id="THRESHOLDS",
        details=f"Allow: {payload.allow_threshold}, Review: {payload.review_threshold}"
    ))
    db.commit()

    return {"status": "success", "allow_threshold": payload.allow_threshold, "review_threshold": payload.review_threshold}
