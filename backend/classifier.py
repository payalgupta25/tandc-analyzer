import yaml
from transformers import pipeline

# Load configuration
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

LABELS = config.get("labels", [])
THRESHOLD = config.get("threshold", 0.7)

# Load zero-shot classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def classify_clauses(clauses, threshold=THRESHOLD):
    predicted_labels = []

    for clause in clauses:
        print("\n[CLAUSE]", clause)
        result = classifier(clause, LABELS, multi_label=True)

        for label, score in zip(result["labels"], result["scores"]):
            print(f"  [SCORE] {label}: {score:.3f}")
            if score >= threshold:
                predicted_labels.append(label)

    return predicted_labels