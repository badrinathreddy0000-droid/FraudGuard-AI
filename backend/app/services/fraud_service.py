import json
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.models import TransactionRecord, AuditLog, SystemSetting
from app.ml.model_manager import model_manager
from app.services.rules_engine import RulesEngine
from app.core.config import settings

class FraudService:
    """Orchestrates ML inference, rule enforcement, scoring, and transaction triage."""

    @staticmethod
    def get_thresholds(db: Session) -> tuple[float, float]:
        allow_setting = db.query(SystemSetting).filter(SystemSetting.key == "allow_threshold").first()
        review_setting = db.query(SystemSetting).filter(SystemSetting.key == "review_threshold").first()
        allow_th = float(allow_setting.value) if allow_setting else settings.DEFAULT_ALLOW_THRESHOLD
        review_th = float(review_setting.value) if review_setting else settings.DEFAULT_REVIEW_THRESHOLD
        return allow_th, review_th

    @staticmethod
    def score_transaction(
        features: Dict[str, Any],
        db: Session,
        actor_email: str = "system"
    ) -> TransactionRecord:
        """Evaluates ML model and rule engine, determines decision, and records transaction."""
        allow_threshold, review_threshold = FraudService.get_thresholds(db)

        # 1. Run ML Model Inference
        risk_score, risk_level, explanations = model_manager.predict(features)

        # 2. Run Heuristic Rules
        triggered_rules, rule_action = RulesEngine.evaluate_rules(features, db)

        # 3. Decision Arbiter
        if rule_action == "BLOCK" or risk_score >= review_threshold:
            decision = "BLOCK"
        elif rule_action == "REVIEW" or risk_score >= allow_threshold:
            decision = "REVIEW"
        else:
            decision = "ALLOW"

        # 4. Extract Key Metadata
        tx_id = features.get("transaction_id") or f"TX-{uuid.uuid4().hex[:8].upper()}"
        amount = float(features.get("TransactionAmt", features.get("amount", 68.5)))
        product_cd = str(features.get("ProductCD", features.get("product_cd", "W")))
        card4 = str(features.get("card4", "visa"))
        card6 = str(features.get("card6", "debit"))
        p_email = str(features.get("P_emaildomain", features.get("p_email", "gmail.com")))
        r_email = str(features.get("R_emaildomain", features.get("r_email", "")))
        c1 = float(features.get("C1", features.get("c1", 1.0)))
        dist1 = float(features.get("dist1", 0.0))

        # 5. Persist Transaction Record
        record = TransactionRecord(
            transaction_id=tx_id,
            transaction_dt=int(features.get("TransactionDT", 86400)),
            amount=amount,
            product_cd=product_cd,
            card4=card4,
            card6=card6,
            p_email=p_email,
            r_email=r_email,
            c1=c1,
            dist1=dist1,
            risk_score=round(risk_score, 4),
            risk_level=risk_level,
            decision=decision,
            model_used=model_manager.active_model_name,
            top_risk_factors_json=json.dumps(explanations),
            raw_features_json=json.dumps(features),
            rules_triggered_json=json.dumps(triggered_rules),
            analyst_status="PENDING" if decision != "ALLOW" else "DISMISSED",
            analyst_notes="Auto-triaged by FraudGuard AI arbiter." if decision != "ALLOW" else "Low risk auto-pass."
        )

        db.add(record)

        # 6. Audit Log if Blocked or Reviewed
        if decision in ["BLOCK", "REVIEW"]:
            db.add(AuditLog(
                user_email=actor_email,
                action=f"TRANSACTION_{decision}",
                entity_type="TRANSACTION",
                entity_id=tx_id,
                details=f"Score: {record.risk_score:.2%}, Rules: {triggered_rules}"
            ))

        db.commit()
        db.refresh(record)
        return record
