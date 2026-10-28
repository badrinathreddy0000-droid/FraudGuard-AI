"""Training pipeline for IEEE-CIS Fraud Detection dataset."""
import os
import gc
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import (
    average_precision_score,
    precision_score,
    recall_score,
    f1_score,
    fbeta_score,
    matthews_corrcoef
)
import lightgbm as lgb
from app.core.config import settings

def train_fraud_model(
    data_path: Path = None,
    method: str = "class_weighted",
    pilot_sample_size: int = 50000
) -> dict:
    """Trains a LightGBM model on IEEE-CIS transaction data."""
    if data_path is None:
        data_path = settings.TRAIN_TRANSACTION_PATH

    if not data_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {data_path}. Please place 'train_transaction.csv' inside the 'data/' folder."
        )

    print(f"Reading dataset from {data_path} (sampling {pilot_sample_size} rows)...")
    df = pd.read_csv(data_path, nrows=pilot_sample_size)

    if "isFraud" not in df.columns:
        raise ValueError("Target column 'isFraud' not found in dataset.")

    y = df["isFraud"].copy()
    X = df.drop(columns=["isFraud", "TransactionID"], errors="ignore")

    # Chronological 70/30 split
    split_idx = int(len(df) * 0.70)
    X_train, X_test = X.iloc[:split_idx].copy(), X.iloc[split_idx:].copy()
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    # Categorical handling
    cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
    for col in cat_cols:
        X_train[col] = X_train[col].astype("category")
        X_test[col] = pd.Categorical(X_test[col], categories=X_train[col].cat.categories)

    # Initialize model based on selected method
    class_weight = "balanced" if method == "class_weighted" else None
    model = lgb.LGBMClassifier(
        objective="binary",
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=31,
        class_weight=class_weight,
        random_state=42,
        n_jobs=-1,
        verbosity=-1
    )

    print(f"Fitting LightGBM ({method})...")
    model.fit(X_train, y_train, categorical_feature=cat_cols)

    # Evaluate
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= 0.50).astype(int)

    metrics = {
        "pr_auc": float(average_precision_score(y_test, probs)),
        "precision": float(precision_score(y_test, preds, zero_division=0)),
        "recall": float(recall_score(y_test, preds, zero_division=0)),
        "f1": float(f1_score(y_test, preds, zero_division=0)),
        "f2": float(fbeta_score(y_test, preds, beta=2, zero_division=0)),
        "mcc": float(matthews_corrcoef(y_test, preds))
    }

    # Save artifact
    output_path = settings.ARTIFACTS_DIR / f"lgb_{method}_trained.joblib"
    joblib.dump(model, output_path)
    print(f"Model saved to {output_path} with metrics: {metrics}")

    return {
        "metrics": metrics,
        "saved_path": str(output_path),
        "train_rows": len(X_train),
        "test_rows": len(X_test)
    }

if __name__ == "__main__":
    try:
        train_fraud_model()
    except Exception as e:
        print(f"Training info: {e}")
