import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="analyst")  # admin, analyst, auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TransactionRecord(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    transaction_dt = Column(Integer, nullable=True)  # Timestep from IEEE-CIS
    amount = Column(Float, nullable=False)
    product_cd = Column(String(16), default="W")
    card4 = Column(String(32), default="visa")
    card6 = Column(String(32), default="debit")
    p_email = Column(String(64), default="gmail.com")
    r_email = Column(String(64), default="")
    c1 = Column(Float, default=1.0)
    dist1 = Column(Float, default=0.0)
    
    # Model inference results
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(String(16), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    decision = Column(String(16), nullable=False)  # ALLOW, REVIEW, BLOCK
    model_used = Column(String(64), default="LightGBM Class-Weighted")
    
    # Explanations and storage
    top_risk_factors_json = Column(Text, default="[]")
    raw_features_json = Column(Text, default="{}")
    rules_triggered_json = Column(Text, default="[]")
    
    # Analyst triage
    analyst_status = Column(String(32), default="PENDING")  # PENDING, CONFIRMED_FRAUD, FALSE_POSITIVE, DISMISSED
    analyst_notes = Column(Text, default="")
    reviewed_by = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    @property
    def top_risk_factors(self):
        try:
            return json.loads(self.top_risk_factors_json)
        except Exception:
            return []

    @property
    def rules_triggered(self):
        try:
            return json.loads(self.rules_triggered_json)
        except Exception:
            return []

class FraudRule(Base):
    __tablename__ = "fraud_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)
    description = Column(String(256), default="")
    field = Column(String(64), nullable=False)  # e.g., amount, c1, dist1, p_email
    operator = Column(String(16), nullable=False)  # >, <, ==, !=, in, contains
    threshold_value = Column(String(128), nullable=False)
    action = Column(String(16), default="REVIEW")  # ALERT, REVIEW, BLOCK
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ModelBenchmark(Base):
    __tablename__ = "model_benchmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    method_name = Column(String(64), nullable=False)  # Baseline, Class-weighted, SMOTENC, Random undersampling
    evaluation_type = Column(String(64), nullable=False)  # Chronological 70/30, Randomized 5-fold CV
    pr_auc = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1 = Column(Float, nullable=False)
    f2 = Column(Float, nullable=False)
    mcc = Column(Float, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, nullable=False)
    value = Column(String(256), nullable=False)
    description = Column(String(256), default="")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), default="")
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
