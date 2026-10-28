from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.database.models import FraudRule

class RulesEngine:
    """Evaluates configurable business rules on incoming transaction telemetry."""

    @staticmethod
    def evaluate_rules(features: Dict[str, Any], db: Session) -> Tuple[List[str], str]:
        """Returns (triggered_rule_names, highest_action)."""
        rules = db.query(FraudRule).filter(FraudRule.is_active == True).all()
        triggered_names = []
        highest_action = "ALLOW"
        action_priority = {"ALLOW": 0, "ALERT": 1, "REVIEW": 2, "BLOCK": 3}

        for rule in rules:
            field_val = features.get(rule.field)
            if field_val is None:
                # Check case variants
                field_val = features.get(rule.field.lower(), features.get(rule.field.upper()))

            if field_val is None:
                continue

            triggered = False
            try:
                if rule.operator == ">":
                    triggered = float(field_val) > float(rule.threshold_value)
                elif rule.operator == "<":
                    triggered = float(field_val) < float(rule.threshold_value)
                elif rule.operator == "==":
                    triggered = str(field_val).lower() == str(rule.threshold_value).lower()
                elif rule.operator == "!=":
                    triggered = str(field_val).lower() != str(rule.threshold_value).lower()
                elif rule.operator == "in":
                    items = [x.strip().lower() for x in rule.threshold_value.split(",")]
                    triggered = str(field_val).lower() in items
                elif rule.operator == "contains":
                    triggered = str(rule.threshold_value).lower() in str(field_val).lower()
            except Exception:
                triggered = False

            if triggered:
                triggered_names.append(rule.name)
                if action_priority.get(rule.action, 0) > action_priority.get(highest_action, 0):
                    highest_action = rule.action

        return triggered_names, highest_action
