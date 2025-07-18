import yaml
from transformers import pipeline

# Load configuration
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

LABELS = config.get("labels", [])
THRESHOLD = config.get("threshold", 0.7)

# Use a smaller, faster zero-shot model
classifier = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli", device=0)
def classify_clauses(clauses, threshold=THRESHOLD):
    # Batch process all clauses at once for speed
    results = classifier(clauses, LABELS, multi_label=True)
    predicted_labels = []
    for result in results:
        for label, score in zip(result["labels"], result["scores"]):
            if score >= threshold:
                predicted_labels.append(label)
    return predicted_labels