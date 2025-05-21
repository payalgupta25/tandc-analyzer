import pytest
import requests

API_URL = "http://localhost:5000"

@pytest.fixture
def example_policy_text():
    return """
    We may collect your personal data and share it with third parties.
    Location tracking and targeted ads may be used to improve your experience.
    Disputes will be resolved via binding arbitration only.
    Account deletion is not available after deactivation.
    """

def test_api_response_structure(example_policy_text):
    payload = {"text": example_policy_text}
    response = requests.post(API_URL, json=payload)
    
    assert response.status_code == 200, "API should return 200 OK"

    data = response.json()
    assert "clause_types" in data
    assert "risk_score" in data
    assert "top_clauses" in data

    assert isinstance(data["clause_types"], list)
    assert isinstance(data["risk_score"], str)
    assert isinstance(data["top_clauses"], list)

def test_api_risk_score_not_zero(example_policy_text):
    payload = {"text": example_policy_text}
    response = requests.post(API_URL, json=payload)
    data = response.json()

    numeric_score = int(data["risk_score"].split("/")[0])
    assert numeric_score > 0, "Risk score should be > 0 for this input"
