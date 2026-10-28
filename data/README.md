# IEEE-CIS Fraud Detection Dataset Directory

This directory is designated for raw Kaggle IEEE-CIS Fraud Detection dataset files.

## Dataset Files
- `train_transaction.csv` (~1.4 GB, 590,540 rows, 394 columns)
- `train_identity.csv` (~50 MB, 144,233 rows, 41 columns)

## Why is the full dataset not bundled?
The raw dataset is approximately **2.0 GB**. In accordance with enterprise best practices and project instructions, large binary data files are not tracked in git to prevent bloating the workspace.

## How to Configure Your Dataset Path
1. Download `train_transaction.csv` from [Kaggle IEEE-CIS Fraud Detection](https://www.kaggle.com/c/ieee-fraud-detection).
2. Place `train_transaction.csv` into this directory:
   `C:\Users\<Username>\Desktop\FraudGuard-AI\data\train_transaction.csv`
3. Configure the path in `backend/app/core/config.py` (defaults to `data/train_transaction.csv`):
   ```python
   TRAIN_TRANSACTION_PATH = BASE_DIR.parent / "data" / "train_transaction.csv"
   ```
4. You can then trigger full dataset retraining either via the UI (**System & Datasets** page) or by running:
   ```powershell
   & .\backend\venv\Scripts\python.exe -m app.ml.trainer
   ```

*Note: FraudGuard AI runs out-of-the-box using the calibrated LightGBM model weights and notebook benchmark results even if the 2 GB raw training file is not present.*
