"""IEEE-CIS Fraud Detection Feature Schema Definitions."""

CATEGORICAL_FEATURES = [
    "ProductCD", "card4", "card6", "P_emaildomain", "R_emaildomain",
    "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"
]

CORE_NUMERICAL_FEATURES = [
    "TransactionAmt", "TransactionDT",
    "card1", "card2", "card3", "card5",
    "addr1", "addr2", "dist1", "dist2",
    "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14",
    "D1", "D2", "D3", "D4", "D10", "D11", "D15",
    "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13",
    "V29", "V30", "V44", "V45", "V53", "V54", "V66", "V67", "V75", "V76", "V77", "V78",
    "V82", "V83", "V86", "V87", "V90", "V91", "V94", "V95", "V96", "V97", "V98", "V99",
    "V126", "V127", "V128", "V130", "V131", "V132", "V133", "V134", "V135", "V136", "V137",
    "V281", "V282", "V283", "V284", "V285", "V286", "V287", "V288", "V289", "V290", "V306", "V307", "V308", "V310"
]

DEFAULT_MEDIANS = {
    "TransactionAmt": 68.5,
    "TransactionDT": 86400,
    "card1": 9632.0,
    "card2": 361.0,
    "card3": 150.0,
    "card5": 226.0,
    "addr1": 299.0,
    "addr2": 87.0,
    "dist1": 8.0,
    "dist2": 0.0,
    "C1": 1.0, "C2": 1.0, "C3": 0.0, "C4": 0.0, "C5": 0.0, "C6": 1.0, "C7": 0.0,
    "C8": 0.0, "C9": 1.0, "C10": 0.0, "C11": 1.0, "C12": 0.0, "C13": 3.0, "C14": 1.0,
    "D1": 3.0, "D2": 97.0, "D3": 8.0, "D4": 26.0, "D10": 15.0, "D11": 43.0, "D15": 52.0,
    "V1": 1.0, "V2": 1.0, "V3": 1.0, "V4": 1.0, "V5": 1.0, "V6": 1.0, "V7": 1.0, "V8": 1.0, "V9": 1.0, "V10": 0.0,
    "V11": 0.0, "V12": 1.0, "V13": 1.0, "V29": 0.0, "V30": 0.0, "V44": 1.0, "V45": 1.0, "V53": 1.0, "V54": 1.0,
    "V66": 1.0, "V67": 1.0, "V75": 1.0, "V76": 1.0, "V77": 1.0, "V78": 1.0, "V82": 1.0, "V83": 1.0, "V86": 1.0,
    "V87": 1.0, "V90": 0.0, "V91": 0.0, "V94": 0.0, "V95": 0.0, "V96": 0.0, "V97": 0.0, "V98": 0.0, "V99": 0.0,
    "V126": 0.0, "V127": 0.0, "V128": 0.0, "V130": 0.0, "V131": 0.0, "V132": 0.0, "V133": 0.0, "V134": 0.0,
    "V135": 0.0, "V136": 0.0, "V137": 0.0, "V281": 0.0, "V282": 1.0, "V283": 1.0, "V284": 0.0, "V285": 0.0,
    "V286": 0.0, "V287": 0.0, "V288": 0.0, "V289": 0.0, "V290": 1.0, "V306": 0.0, "V307": 0.0, "V308": 0.0, "V310": 0.0
}

DEFAULT_CATEGORIES = {
    "ProductCD": "W",
    "card4": "visa",
    "card6": "debit",
    "P_emaildomain": "gmail.com",
    "R_emaildomain": "",
    "M1": "T", "M2": "T", "M3": "T", "M4": "M0", "M5": "F", "M6": "F", "M7": "F", "M8": "F", "M9": "F"
}

FEATURE_DESCRIPTIONS = {
    "TransactionAmt": "Transaction amount in USD",
    "ProductCD": "Product code for the transaction (W, C, R, H, S)",
    "card4": "Payment card brand (visa, mastercard, discover, american express)",
    "card6": "Payment card type (debit, credit, charge card)",
    "P_emaildomain": "Purchaser email domain",
    "R_emaildomain": "Recipient email domain",
    "C1": "Velocity count of card/phone/address linkages (burst indicator)",
    "dist1": "Distance between billing address and postal code (miles)",
    "addr1": "Purchaser billing region code",
    "addr2": "Purchaser billing country code"
}
