from transformers import pipeline

# Load zero-shot classification model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Define clause categories relevant to T&C risk
LABELS = [
    "data_sharing",
    "ads",
    "third_party_services",
    "auto_renewal",
    "arbitration",
    "account_deletion_restriction",
    "location_tracking",
    "biometrics",
    "no_opt_out",
    "user_content_rights",
    "gdpr_compliance",
    "data_deletion_policy"
]

def classify_clauses(clauses, threshold=0.7):
    predicted_labels = []

    for clause in clauses:
        result = classifier(clause, LABELS, multi_label=True)

        # Add labels with confidence ≥ threshold
        for label, score in zip(result["labels"], result["scores"]):
            if score >= threshold:
                predicted_labels.append(label)

    return predicted_labels
