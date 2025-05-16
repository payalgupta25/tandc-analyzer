export async function classifyWithBERT(text) {
  try {
    const res = await fetch("http://localhost:5000/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return await res.json();
  } catch (err) {
    console.error("BERT fetch failed", err);
    return { risk_score: "0/10", clause_types: [], top_clauses: [] };
  }
}
