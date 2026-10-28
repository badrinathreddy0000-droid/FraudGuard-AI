from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "FraudGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "fraudguard-ai-secure-jwt-secret-key-production-grade-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/fraudguard.db"
    
    # Storage Paths
    ROOT_DIR: Path = BASE_DIR.parent
    DATA_DIR: Path = BASE_DIR.parent / "data"
    ARTIFACTS_DIR: Path = BASE_DIR.parent / "artifacts"
    NOTEBOOKS_DIR: Path = BASE_DIR.parent / "notebooks"
    
    # Dataset Files
    TRAIN_TRANSACTION_PATH: Path = BASE_DIR.parent / "data" / "train_transaction.csv"
    TRAIN_IDENTITY_PATH: Path = BASE_DIR.parent / "data" / "train_identity.csv"
    
    # Default Risk Thresholds (from IEEE-CIS benchmark analysis)
    DEFAULT_ALLOW_THRESHOLD: float = 0.35   # < 0.35 -> Allow
    DEFAULT_REVIEW_THRESHOLD: float = 0.70  # 0.35 to 0.70 -> Manual Review, >= 0.70 -> Block

settings = Settings()
