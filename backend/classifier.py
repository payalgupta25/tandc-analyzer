from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

# -------------------------
# MODEL CONFIG
# -------------------------
MODEL_NAME = "bhadresh-savani/bert-base-uncased-emotion"  # temporary multi-label model
# You can replace this with a fine-tuned LegalBERT later

# -------------------------
# LOAD MODEL ONCE
# -------------------------
print("🔍 Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True)

# -------------------------
# CLAUSE CLASSIFICATION
# -------------------------
def classify_clauses(clauses, threshold=0.5):
    results = []
    
    for clause in clauses:
        output = classifier(clause)[0]  # multi-class scores
        top = max(output, key=lambda x: x['score'])
        
        if top['score'] >= threshold:
            label = top['label'].lower().strip().replace(" ", "_")
            results.append(label)
    
    return results
