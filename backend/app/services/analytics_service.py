from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import TransactionRecord, ModelBenchmark

class AnalyticsService:
    """Aggregates executive KPIs, risk distributions, and research benchmark comparisons."""

    @staticmethod
    def get_dashboard_kpis(db: Session) -> Dict[str, Any]:
        total_txs = db.query(TransactionRecord).count()
        if total_txs == 0:
            return {
                "total_scanned": 0,
                "fraud_rate": 0.0,
                "blocked_count": 0,
                "review_count": 0,
                "allowed_count": 0,
                "amount_saved": 0.0,
                "total_volume": 0.0,
                "avg_risk_score": 0.0
            }

        blocked = db.query(TransactionRecord).filter(TransactionRecord.decision == "BLOCK").count()
        review = db.query(TransactionRecord).filter(TransactionRecord.decision == "REVIEW").count()
        allowed = db.query(TransactionRecord).filter(TransactionRecord.decision == "ALLOW").count()

        amount_saved = db.query(func.sum(TransactionRecord.amount)).filter(
            TransactionRecord.decision == "BLOCK"
        ).scalar() or 0.0

        total_vol = db.query(func.sum(TransactionRecord.amount)).scalar() or 0.0
        avg_score = db.query(func.avg(TransactionRecord.risk_score)).scalar() or 0.0

        fraud_rate = (blocked / total_txs) * 100.0

        # Risk level breakdown
        risk_dist = {
            "low": db.query(TransactionRecord).filter(TransactionRecord.risk_level == "LOW").count(),
            "medium": db.query(TransactionRecord).filter(TransactionRecord.risk_level == "MEDIUM").count(),
            "high": db.query(TransactionRecord).filter(TransactionRecord.risk_level == "HIGH").count(),
            "critical": db.query(TransactionRecord).filter(TransactionRecord.risk_level == "CRITICAL").count(),
        }

        # Analyst status breakdown
        status_dist = {
            "pending": db.query(TransactionRecord).filter(TransactionRecord.analyst_status == "PENDING").count(),
            "confirmed_fraud": db.query(TransactionRecord).filter(TransactionRecord.analyst_status == "CONFIRMED_FRAUD").count(),
            "false_positive": db.query(TransactionRecord).filter(TransactionRecord.analyst_status == "FALSE_POSITIVE").count(),
            "dismissed": db.query(TransactionRecord).filter(TransactionRecord.analyst_status == "DISMISSED").count(),
        }

        return {
            "total_scanned": total_txs,
            "fraud_rate": round(fraud_rate, 2),
            "blocked_count": blocked,
            "review_count": review,
            "allowed_count": allowed,
            "amount_saved": round(amount_saved, 2),
            "total_volume": round(total_vol, 2),
            "avg_risk_score": round(avg_score, 4),
            "risk_distribution": risk_dist,
            "status_distribution": status_dist
        }

    @staticmethod
    def get_timeline_data(db: Session) -> List[Dict[str, Any]]:
        """Generates hourly volume vs fraud time series data for charts."""
        # Query recent transactions ordered by time
        txs = db.query(TransactionRecord).order_by(TransactionRecord.created_at.asc()).limit(100).all()

        timeline = []
        for i, tx in enumerate(txs):
            timeline.append({
                "time": tx.created_at.strftime("%H:%M"),
                "amount": tx.amount,
                "risk_score": tx.risk_score * 100,
                "is_fraud": 1 if tx.decision == "BLOCK" else 0,
                "decision": tx.decision
            })
        return timeline
