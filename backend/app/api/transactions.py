import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import TransactionRecord, AuditLog, User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class TriageUpdate(BaseModel):
    status: str  # CONFIRMED_FRAUD, FALSE_POSITIVE, DISMISSED
    notes: Optional[str] = ""

class TransactionSummary(BaseModel):
    id: int
    transaction_id: str
    amount: float
    product_cd: str
    card4: str
    card6: str
    p_email: str
    risk_score: float
    risk_level: str
    decision: str
    rules_triggered: List[str]
    analyst_status: str
    analyst_notes: str
    created_at: str

@router.get("", response_model=Dict[str, Any])
def list_transactions(
    decision: Optional[str] = None,
    risk_level: Optional[str] = None,
    analyst_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TransactionRecord)

    if decision:
        query = query.filter(TransactionRecord.decision == decision.upper())
    if risk_level:
        query = query.filter(TransactionRecord.risk_level == risk_level.upper())
    if analyst_status:
        query = query.filter(TransactionRecord.analyst_status == analyst_status.upper())
    if search:
        s = f"%{search}%"
        query = query.filter(
            (TransactionRecord.transaction_id.ilike(s)) |
            (TransactionRecord.p_email.ilike(s)) |
            (TransactionRecord.card4.ilike(s))
        )

    total = query.count()
    records = query.order_by(desc(TransactionRecord.created_at)).offset(skip).limit(limit).all()

    items = []
    for r in records:
        items.append({
            "id": r.id,
            "transaction_id": r.transaction_id,
            "amount": r.amount,
            "product_cd": r.product_cd,
            "card4": r.card4,
            "card6": r.card6,
            "p_email": r.p_email,
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "decision": r.decision,
            "rules_triggered": r.rules_triggered,
            "analyst_status": r.analyst_status,
            "analyst_notes": r.analyst_notes or "",
            "created_at": r.created_at.isoformat()
        })

    return {"total": total, "items": items}

@router.get("/{tx_id}")
def get_transaction_detail(
    tx_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(TransactionRecord).filter(
        (TransactionRecord.transaction_id == tx_id) | (TransactionRecord.id == int(tx_id) if tx_id.isdigit() else False)
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        raw_feat = json.loads(record.raw_features_json)
    except Exception:
        raw_feat = {}

    return {
        "id": record.id,
        "transaction_id": record.transaction_id,
        "transaction_dt": record.transaction_dt,
        "amount": record.amount,
        "product_cd": record.product_cd,
        "card4": record.card4,
        "card6": record.card6,
        "p_email": record.p_email,
        "r_email": record.r_email,
        "c1": record.c1,
        "dist1": record.dist1,
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "decision": record.decision,
        "model_used": record.model_used,
        "rules_triggered": record.rules_triggered,
        "top_risk_factors": record.top_risk_factors,
        "raw_features": raw_feat,
        "analyst_status": record.analyst_status,
        "analyst_notes": record.analyst_notes,
        "reviewed_by": record.reviewed_by,
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
        "created_at": record.created_at.isoformat()
    }

@router.patch("/{tx_id}/triage")
def update_triage_status(
    tx_id: str,
    payload: TriageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_statuses = ["PENDING", "CONFIRMED_FRAUD", "FALSE_POSITIVE", "DISMISSED"]
    if payload.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    record = db.query(TransactionRecord).filter(
        (TransactionRecord.transaction_id == tx_id) | (TransactionRecord.id == int(tx_id) if tx_id.isdigit() else False)
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")

    old_status = record.analyst_status
    record.analyst_status = payload.status.upper()
    if payload.notes:
        record.analyst_notes = payload.notes
    record.reviewed_by = current_user.email
    record.reviewed_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        user_email=current_user.email,
        action="ANALYST_TRIAGE",
        entity_type="TRANSACTION",
        entity_id=record.transaction_id,
        details=f"Status changed from {old_status} to {record.analyst_status}. Notes: {payload.notes}"
    ))

    db.commit()
    db.refresh(record)
    return {"status": "success", "analyst_status": record.analyst_status, "transaction_id": record.transaction_id}
