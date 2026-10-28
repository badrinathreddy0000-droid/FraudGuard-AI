# Model Artifacts Directory

This directory stores serialized machine learning models, feature preprocessors, calibration parameters, and evaluation summaries.

## Artifact Manifest
- `fraudguard_lightgbm.joblib`: Serialized LightGBM classifier calibrated on IEEE-CIS feature distributions.
- `lgb_class_weighted_trained.joblib`: Model artifact generated when running full dataset retraining.
- `fraud_model_results.csv`: Benchmark evaluation table comparing Baseline, Class-Weighted, SMOTENC, and Undersampling methods.

## Model Summary
- **Algorithm**: LightGBM (`LGBMClassifier`)
- **Objective**: Binary Logloss (`binary`)
- **Class Balancing**: `scale_pos_weight` / `class_weight="balanced"`
- **Evaluation Splits**: Chronological 70/30 (Primary) and Stratified 5-Fold Cross Validation
