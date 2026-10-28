import io
import csv
import json
import uuid
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.fraud_service import FraudService
from app.database.models import TransactionRecord, AuditLog

class BatchService:
    """Processes bulk CSV transaction uploads and generates analytics summary."""

    @staticmethod
    def process_csv(
        file_contents: bytes,
        db: Session,
        actor_email: str = "batch_worker"
    ) -> Dict[str, Any]:
        """Parses CSV, scores each row through FraudService, and returns summary & results."""
        df = pd.read_csv(io.BytesIO(file_contents))

        results = []
        total_amount = 0.0
        blocked_amount = 0.0
        counts = {"ALLOW": 0, "REVIEW": 0, "BLOCK": 0}

        # Process up to 500 rows per batch for real-time responsiveness
        process_df = df.head(500)

        for _, row in process_df.iterrows():
            features = row.to_dict()
            amt = float(features.get("TransactionAmt", features.get("amount", 0.0)))
            total_amount += amt

            record = FraudService.score_transaction(features, db, actor_email=actor_email)
            counts[record.decision] = counts.get(record.decision, 0) + 1

            if record.decision == "BLOCK":
                blocked_amount += amt

            results.append({
                "transaction_id": record.transaction_id,
                "amount": record.amount,
                "product_cd": record.product_cd,
                "card4": record.card4,
                "p_email": record.p_email,
                "c1": record.c1,
                "risk_score": record.risk_score,
                "risk_level": record.risk_level,
                "decision": record.decision,
                "rules_triggered": record.rules_triggered,
                "top_risk_driver": record.top_risk_factors[0]["description"] if record.top_risk_factors else "None"
            })

        db.add(AuditLog(
            user_email=actor_email,
            action="BATCH_EVALUATION",
            entity_type="BATCH",
            entity_id=f"BATCH-{uuid.uuid4().hex[:6].upper()}",
            details=f"Processed {len(results)} rows. Blocked: {counts['BLOCK']}, Review: {counts['REVIEW']}, Allowed: {counts['ALLOW']}"
        ))
        db.commit()

        total_scanned = len(results)
        fraud_rate = (counts["BLOCK"] / total_scanned * 100) if total_scanned > 0 else 0.0

        return {
            "total_processed": total_scanned,
            "total_amount_scanned": round(total_amount, 2),
            "blocked_amount_prevented": round(blocked_amount, 2),
            "fraud_rate_pct": round(fraud_rate, 2),
            "counts": counts,
            "transactions": results
        }
