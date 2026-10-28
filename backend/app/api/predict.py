from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
from app.services.fraud_service import FraudService

router = APIRouter(prefix="/predict", tags=["Inference"])

class TransactionInput(BaseModel):
    transaction_id: Optional[str] = None
    TransactionAmt: float = Field(..., description="Transaction amount in USD", example=145.50)
    ProductCD: str = Field(default="W", description="Product code: W, C, R, H, S", example="W")
    card4: str = Field(default="visa", description="Card brand: visa, mastercard, discover, american express", example="visa")
    card6: str = Field(default="debit", description="Card type: debit, credit", example="debit")
    P_emaildomain: str = Field(default="gmail.com", description="Purchaser email domain", example="gmail.com")
    R_emaildomain: Optional[str] = Field(default="", description="Recipient email domain", example="")
    C1: float = Field(default=1.0, description="Velocity count C1", example=1.0)
    dist1: float = Field(default=0.0, description="Billing/postal distance in miles", example=15.0)
    addr1: Optional[float] = Field(default=299.0, description="Billing region code", example=299.0)
    addr2: Optional[float] = Field(default=87.0, description="Billing country code", example=87.0)
    additional_features: Optional[Dict[str, Any]] = Field(default_factory=dict)

class RiskFactor(BaseModel):
    feature: str
    impact: str
    score_contribution: str
    description: str

class PredictionResponse(BaseModel):
    transaction_id: str
    risk_score: float
    risk_score_pct: str
    risk_level: str
    decision: str
    model_used: str
    rules_triggered: List[str]
    top_risk_factors: List[RiskFactor]
    amount: float
    created_at: str

@router.post("", response_model=PredictionResponse)
def score_single_transaction(
    payload: TransactionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Scores a single transaction through the active ML model and heuristic rules engine."""
    input_data = payload.model_dump()
    extra = input_data.pop("additional_features", {}) or {}
    input_data.update(extra)

    record = FraudService.score_transaction(
        features=input_data,
        db=db,
        actor_email=current_user.email
    )

    return PredictionResponse(
        transaction_id=record.transaction_id,
        risk_score=record.risk_score,
        risk_score_pct=f"{record.risk_score * 100:.1f}%",
        risk_level=record.risk_level,
        decision=record.decision,
        model_used=record.model_used,
        rules_triggered=record.rules_triggered,
        top_risk_factors=record.top_risk_factors,
        amount=record.amount,
        created_at=record.created_at.isoformat()
    )
