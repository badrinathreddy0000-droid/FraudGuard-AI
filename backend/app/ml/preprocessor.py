import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.ml.feature_schema import (
    CATEGORICAL_FEATURES,
    CORE_NUMERICAL_FEATURES,
    DEFAULT_MEDIANS,
    DEFAULT_CATEGORIES
)

class IEEEPreprocessor:
    """Preprocesses transaction inputs to match IEEE-CIS model features."""

    def __init__(self):
        self.categorical_cols = CATEGORICAL_FEATURES
        self.numerical_cols = CORE_NUMERICAL_FEATURES
        self.medians = DEFAULT_MEDIANS
        self.defaults = DEFAULT_CATEGORIES
        self.category_mappings = {
            "ProductCD": {"W": 0, "C": 1, "R": 2, "H": 3, "S": 4},
            "card4": {"visa": 0, "mastercard": 1, "discover": 2, "american express": 3},
            "card6": {"debit": 0, "credit": 1, "charge card": 2, "debit or credit": 3},
            "P_emaildomain": {"gmail.com": 0, "yahoo.com": 1, "hotmail.com": 2, "anonymous.com": 3, "aol.com": 4, "protonmail.com": 5, "mail.com": 6, "tempmail.com": 7},
            "R_emaildomain": {"": 0, "gmail.com": 1, "hotmail.com": 2, "mail.com": 3, "anonymous.com": 4},
            "M1": {"T": 0, "F": 1}, "M2": {"T": 0, "F": 1}, "M3": {"T": 0, "F": 1},
            "M4": {"M0": 0, "M1": 1, "M2": 2}, "M5": {"F": 0, "T": 1},
            "M6": {"F": 0, "T": 1}, "M7": {"F": 0, "T": 1}, "M8": {"F": 0, "T": 1}, "M9": {"F": 0, "T": 1}
        }

    def transform_single(self, raw_input: Dict[str, Any]) -> pd.DataFrame:
        """Transforms a single transaction dictionary into a 1-row feature DataFrame."""
        row = {}
        # 1. Fill Numerical Features
        for col in self.numerical_cols:
            val = raw_input.get(col)
            if val is None or val == "" or (isinstance(val, float) and np.isnan(val)):
                row[col] = float(self.medians.get(col, 0.0))
            else:
                try:
                    row[col] = float(val)
                except (ValueError, TypeError):
                    row[col] = float(self.medians.get(col, 0.0))

        # 2. Fill and Encode Categorical Features
        for col in self.categorical_cols:
            raw_val = raw_input.get(col)
            if raw_val is None or raw_val == "":
                cat_val = self.defaults.get(col, "__MISSING__")
            else:
                cat_val = str(raw_val).lower().strip()

            mapping = self.category_mappings.get(col, {})
            encoded_val = mapping.get(cat_val, mapping.get(cat_val.lower(), 99))
            row[f"{col}_encoded"] = int(encoded_val)
            row[col] = cat_val

        return pd.DataFrame([row])

    def get_feature_vector(self, df: pd.DataFrame) -> np.ndarray:
        """Extracts numerical matrix for ML model inference."""
        cols = self.numerical_cols + [f"{c}_encoded" for c in self.categorical_cols]
        return df[cols].values
