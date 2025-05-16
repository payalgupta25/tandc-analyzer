from flask import Flask, request, jsonify
from flask_cors import CORS
from classifier import classify_clauses
from risk_score import compute_risk_score

app = Flask(__name__)
CORS(app)  # allow calls from extension

@app.route('/')
def index():
    return "✅ BERT API is running."

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    if 'text' not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    raw_text = data['text']
    clauses = [clause.strip() for clause in raw_text.split('\n') if len(clause.strip()) > 30]

    labels = classify_clauses(clauses)
    risk_score, top_clauses = compute_risk_score(labels)

    return jsonify({
        "clause_types": list(set(labels)),
        "risk_score": f"{risk_score}/10",
        "top_clauses": top_clauses[:6]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
