# risk_score.py

# Risk weights per clause type
RISK_WEIGHTS = {
    "data_sharing": 2,
    "ads": 2,
    "third_party_services": 2,
    "auto_renewal": 2,
    "arbitration": 1,
    "account_deletion_restriction": 1,
    "location_tracking": 2,
    "biometrics": 2,
    "no_opt_out": 2,
    "children_privacy": 1,
    "limited_liability": 1,
    "user_content_rights": 1,
    "gdpr_compliance": -2,
    "data_deletion_policy": -1
}

MAX_SCORE = 10

def compute_risk_score(predicted_labels):
    score = 0
    counted_labels = set()

    # Aggregate score and deduplicate
    for label in predicted_labels:
        if label not in counted_labels and label in RISK_WEIGHTS:
            score += RISK_WEIGHTS[label]
            counted_labels.add(label)

    score = min(score, MAX_SCORE)

    # Human-readable clause types (for showing in UI)
    label_to_text = {
        "data_sharing": "Your data may be shared with third parties.",
        "ads": "Targeted ads and trackers may be used.",
        "third_party_services": "Third-party tools may access your info.",
        "auto_renewal": "Service may auto-renew and charge you.",
        "arbitration": "Disputes resolved by mandatory arbitration.",
        "account_deletion_restriction": "Limited ability to delete your account.",
        "location_tracking": "App may track your location.",
        "biometrics": "Biometric or sensitive data may be collected.",
        "no_opt_out": "No way to opt out of data collection.",
        "children_privacy": "Involves children under 13 without clear safeguards.",
        "limited_liability": "Limited legal liability for company.",
        "user_content_rights": "They can reuse or republish your content.",
        "gdpr_compliance": "Mentions GDPR or CCPA compliance.",
        "data_deletion_policy": "Mentions ability to delete your data."
    }

    top_clauses = [label_to_text[label] for label in counted_labels if label in label_to_text]

    print(f"Computed risk score: {score}")
    return score, top_clauses
