import json
from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, Base, engine
from app.database.models import User, FraudRule, ModelBenchmark, SystemSetting, TransactionRecord, AuditLog
from app.core.security import get_password_hash

def seed_database():
    """Initializes tables and seeds initial data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Users if empty
        if db.query(User).count() == 0:
            users = [
                User(
                    username="admin",
                    email="admin@fraudguard.ai",
                    hashed_password=get_password_hash("Admin@123"),
                    role="admin"
                ),
                User(
                    username="analyst",
                    email="analyst@fraudguard.ai",
                    hashed_password=get_password_hash("Analyst@123"),
                    role="analyst"
                ),
                User(
                    username="auditor",
                    email="auditor@fraudguard.ai",
                    hashed_password=get_password_hash("Auditor@123"),
                    role="auditor"
                ),
            ]
            db.add_all(users)
            db.commit()
            print("Users seeded successfully.")

        # 2. Seed IEEE-CIS Research Benchmark results directly from the notebook
        if db.query(ModelBenchmark).count() == 0:
            benchmarks = [
                ModelBenchmark(
                    method_name="Baseline LightGBM",
                    evaluation_type="Chronological 70/30",
                    pr_auc=0.5239,
                    precision=0.7549,
                    recall=0.3435,
                    f1=0.4722,
                    f2=0.3855,
                    mcc=0.4985,
                    description="Standard LightGBM trained on historical chronological train split. Conservative, high precision, low recall."
                ),
                ModelBenchmark(
                    method_name="Baseline LightGBM",
                    evaluation_type="Randomized 5-fold CV",
                    pr_auc=0.7109,
                    precision=0.9171,
                    recall=0.4673,
                    f1=0.6190,
                    f2=0.5181,
                    mcc=0.6467,
                    description="Baseline evaluated under random CV. Shows temporal leakage optimism compared to chronological evaluation."
                ),
                ModelBenchmark(
                    method_name="Class-weighted LightGBM",
                    evaluation_type="Chronological 70/30",
                    pr_auc=0.5279,
                    precision=0.2784,
                    recall=0.6612,
                    f1=0.3918,
                    f2=0.5186,
                    mcc=0.3992,
                    description="Highest PR-AUC on chronological split. Boosts fraud detection recall to 66% with scale_pos_weight."
                ),
                ModelBenchmark(
                    method_name="Class-weighted LightGBM",
                    evaluation_type="Randomized 5-fold CV",
                    pr_auc=0.6696,
                    precision=0.2830,
                    recall=0.8097,
                    f1=0.4194,
                    f2=0.5901,
                    mcc=0.4502,
                    description="Class-weighted evaluation under 5-fold CV. Excellent F2 score (0.5901) for fraud loss minimization."
                ),
                ModelBenchmark(
                    method_name="SMOTENC (50% Pilot)",
                    evaluation_type="Chronological 70/30",
                    pr_auc=0.5209,
                    precision=0.7521,
                    recall=0.3572,
                    f1=0.4844,
                    f2=0.3991,
                    mcc=0.5075,
                    description="Synthetic oversampling of nominal/continuous features. Champion F1 score (0.4844) and MCC (0.5075) on chronological split."
                ),
                ModelBenchmark(
                    method_name="SMOTENC (50% Pilot)",
                    evaluation_type="Randomized 5-fold CV",
                    pr_auc=0.6527,
                    precision=0.8758,
                    recall=0.4320,
                    f1=0.5785,
                    f2=0.4807,
                    mcc=0.6063,
                    description="SMOTENC evaluated on randomized stratified CV. High precision (87.6%) with strong MCC."
                ),
                ModelBenchmark(
                    method_name="Random Undersampling",
                    evaluation_type="Chronological 70/30",
                    pr_auc=0.4844,
                    precision=0.1988,
                    recall=0.7265,
                    f1=0.3122,
                    f2=0.4746,
                    mcc=0.3419,
                    description="Majority class undersampling. Highest recall on chronological data (72.65%), capturing the most fraud at the expense of precision."
                ),
                ModelBenchmark(
                    method_name="Random Undersampling",
                    evaluation_type="Randomized 5-fold CV",
                    pr_auc=0.5608,
                    precision=0.1809,
                    recall=0.8202,
                    f1=0.2964,
                    f2=0.4805,
                    mcc=0.3448,
                    description="Random undersampling on 5-fold CV. Highest overall recall across all experiments (82.02%)."
                ),
            ]
            db.add_all(benchmarks)
            db.commit()
            print("Model benchmarks seeded successfully.")

        # 3. Seed Fraud Rules
        if db.query(FraudRule).count() == 0:
            rules = [
                FraudRule(
                    name="High-Value Single Transaction",
                    description="Flags transactions greater than $5,000 for critical auto-block",
                    field="amount",
                    operator=">",
                    threshold_value="5000.0",
                    action="BLOCK"
                ),
                FraudRule(
                    name="Extreme Transaction Velocity (C1)",
                    description="Flags abnormal burst frequency C1 > 20 within observation window",
                    field="c1",
                    operator=">",
                    threshold_value="20.0",
                    action="REVIEW"
                ),
                FraudRule(
                    name="High Distance Geo-Mismatch",
                    description="Flags transactions where billing/shipping distance exceeds 1,200 miles",
                    field="dist1",
                    operator=">",
                    threshold_value="1200.0",
                    action="REVIEW"
                ),
                FraudRule(
                    name="Anonymous/Disposable Email Domain",
                    description="Flags email domains commonly associated with temporary disposables",
                    field="p_email",
                    operator="in",
                    threshold_value="protonmail.com,mail.com,tempmail.com,anonymous.com",
                    action="REVIEW"
                ),
                FraudRule(
                    name="Micro-Charge Card Testing Pattern",
                    description="Detects micro-charges under $2.00 typically used by automated bot card testers",
                    field="amount",
                    operator="<",
                    threshold_value="2.0",
                    action="REVIEW"
                ),
                FraudRule(
                    name="High-Velocity Discover Card",
                    description="Flags Discover card transactions with velocity C1 > 8",
                    field="c1",
                    operator=">",
                    threshold_value="8.0",
                    action="BLOCK"
                )
            ]
            db.add_all(rules)
            db.commit()
            print("Fraud rules seeded successfully.")

        # 4. Seed System Settings
        if db.query(SystemSetting).count() == 0:
            settings_list = [
                SystemSetting(key="active_model", value="Class-weighted LightGBM", description="Active ML model for live transaction scoring"),
                SystemSetting(key="allow_threshold", value="0.35", description="Scores below this are automatically allowed"),
                SystemSetting(key="review_threshold", value="0.70", description="Scores between allow and review thresholds are queued for triage"),
                SystemSetting(key="auto_block_enabled", value="true", description="Whether scores >= review_threshold are auto-blocked"),
                SystemSetting(key="hybrid_rules_enabled", value="true", description="Whether heuristic rules override or supplement ML scoring")
            ]
            db.add_all(settings_list)
            db.commit()
            print("System settings seeded successfully.")

        # 5. Seed Demonstration Transactions
        if db.query(TransactionRecord).count() == 0:
            now = datetime.now(timezone.utc)
            demo_txs = [
                TransactionRecord(
                    transaction_id="TX-IEEE-890124",
                    transaction_dt=86400,
                    amount=45.50,
                    product_cd="W",
                    card4="visa",
                    card6="debit",
                    p_email="gmail.com",
                    r_email="",
                    c1=1.0,
                    dist1=12.0,
                    risk_score=0.042,
                    risk_level="LOW",
                    decision="ALLOW",
                    model_used="Class-weighted LightGBM",
                    top_risk_factors_json=json.dumps([
                        {"feature": "amount", "impact": "negative", "description": "Standard retail amount ($45.50)"},
                        {"feature": "p_email", "impact": "negative", "description": "Reputable consumer email domain (gmail.com)"},
                        {"feature": "c1", "impact": "negative", "description": "Normal single transaction velocity (1.0)"}
                    ]),
                    raw_features_json=json.dumps({"TransactionAmt": 45.50, "ProductCD": "W", "card4": "visa", "card6": "debit"}),
                    rules_triggered_json=json.dumps([]),
                    analyst_status="DISMISSED",
                    analyst_notes="Verified everyday grocery purchase.",
                    reviewed_by="analyst@fraudguard.ai",
                    reviewed_at=now - timedelta(hours=3),
                    created_at=now - timedelta(hours=5)
                ),
                TransactionRecord(
                    transaction_id="TX-IEEE-890125",
                    transaction_dt=86520,
                    amount=4850.00,
                    product_cd="C",
                    card4="mastercard",
                    card6="credit",
                    p_email="protonmail.com",
                    r_email="mail.com",
                    c1=14.0,
                    dist1=1450.0,
                    risk_score=0.912,
                    risk_level="CRITICAL",
                    decision="BLOCK",
                    model_used="Class-weighted LightGBM",
                    top_risk_factors_json=json.dumps([
                        {"feature": "amount", "impact": "positive", "description": "Abnormally high dollar value ($4,850.00)"},
                        {"feature": "p_email", "impact": "positive", "description": "Anonymous email domain (protonmail.com)"},
                        {"feature": "c1", "impact": "positive", "description": "High transaction velocity burst (14 transactions)"},
                        {"feature": "dist1", "impact": "positive", "description": "Large cross-border geo mismatch (1,450 miles)"}
                    ]),
                    raw_features_json=json.dumps({"TransactionAmt": 4850.00, "ProductCD": "C", "card4": "mastercard", "card6": "credit"}),
                    rules_triggered_json=json.dumps(["Extreme Transaction Velocity (C1)", "High Distance Geo-Mismatch", "Anonymous/Disposable Email Domain"]),
                    analyst_status="CONFIRMED_FRAUD",
                    analyst_notes="Account takeover pattern with foreign IP and card burst. Card blocked.",
                    reviewed_by="admin@fraudguard.ai",
                    reviewed_at=now - timedelta(hours=2),
                    created_at=now - timedelta(hours=4)
                ),
                TransactionRecord(
                    transaction_id="TX-IEEE-890126",
                    transaction_dt=86600,
                    amount=620.00,
                    product_cd="W",
                    card4="visa",
                    card6="credit",
                    p_email="yahoo.com",
                    r_email="",
                    c1=4.0,
                    dist1=180.0,
                    risk_score=0.485,
                    risk_level="MEDIUM",
                    decision="REVIEW",
                    model_used="Class-weighted LightGBM",
                    top_risk_factors_json=json.dumps([
                        {"feature": "amount", "impact": "positive", "description": "Above-average purchase amount ($620.00)"},
                        {"feature": "c1", "impact": "positive", "description": "Slight velocity elevation (4.0)"},
                        {"feature": "card6", "impact": "neutral", "description": "Standard credit line"}
                    ]),
                    raw_features_json=json.dumps({"TransactionAmt": 620.00, "ProductCD": "W", "card4": "visa", "card6": "credit"}),
                    rules_triggered_json=json.dumps([]),
                    analyst_status="PENDING",
                    analyst_notes="",
                    reviewed_by=None,
                    reviewed_at=None,
                    created_at=now - timedelta(hours=2)
                ),
                TransactionRecord(
                    transaction_id="TX-IEEE-890127",
                    transaction_dt=86710,
                    amount=1.15,
                    product_cd="C",
                    card4="discover",
                    card6="credit",
                    p_email="tempmail.com",
                    r_email="",
                    c1=22.0,
                    dist1=0.0,
                    risk_score=0.884,
                    risk_level="HIGH",
                    decision="BLOCK",
                    model_used="Class-weighted LightGBM",
                    top_risk_factors_json=json.dumps([
                        {"feature": "c1", "impact": "positive", "description": "Extreme burst velocity (22.0)"},
                        {"feature": "amount", "impact": "positive", "description": "Micro-charge card testing amount ($1.15)"},
                        {"feature": "p_email", "impact": "positive", "description": "Known disposable email domain (tempmail.com)"}
                    ]),
                    raw_features_json=json.dumps({"TransactionAmt": 1.15, "ProductCD": "C", "card4": "discover", "card6": "credit"}),
                    rules_triggered_json=json.dumps(["Extreme Transaction Velocity (C1)", "Anonymous/Disposable Email Domain", "Micro-Charge Card Testing Pattern"]),
                    analyst_status="PENDING",
                    analyst_notes="",
                    reviewed_by=None,
                    reviewed_at=None,
                    created_at=now - timedelta(minutes=45)
                ),
                TransactionRecord(
                    transaction_id="TX-IEEE-890128",
                    transaction_dt=86850,
                    amount=120.00,
                    product_cd="W",
                    card4="mastercard",
                    card6="debit",
                    p_email="hotmail.com",
                    r_email="",
                    c1=1.0,
                    dist1=5.0,
                    risk_score=0.082,
                    risk_level="LOW",
                    decision="ALLOW",
                    model_used="Class-weighted LightGBM",
                    top_risk_factors_json=json.dumps([
                        {"feature": "amount", "impact": "negative", "description": "Standard recurring utility bill ($120.00)"},
                        {"feature": "dist1", "impact": "negative", "description": "Local billing match (5 miles)"}
                    ]),
                    raw_features_json=json.dumps({"TransactionAmt": 120.00, "ProductCD": "W", "card4": "mastercard", "card6": "debit"}),
                    rules_triggered_json=json.dumps([]),
                    analyst_status="DISMISSED",
                    analyst_notes="Known returning customer.",
                    reviewed_by="analyst@fraudguard.ai",
                    reviewed_at=now - timedelta(minutes=15),
                    created_at=now - timedelta(minutes=30)
                )
            ]
            db.add_all(demo_txs)
            
            # Add audit log
            db.add(AuditLog(
                user_email="system@fraudguard.ai",
                action="INITIALIZE_SEED_DATA",
                entity_type="SYSTEM",
                entity_id="SETUP",
                details="Initial benchmark models, security rules, and sample telemetry created."
            ))
            
            db.commit()
            print("Demo transactions and audit log seeded successfully.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
