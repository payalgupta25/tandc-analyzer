export async function callGeminiAnalysis(text) {
  const GEMINI_API_KEY = "AIzaSyAqp-kUY8SUXs_Tah7xPgzXjd67sYwyMpk";

  const prompt = `
You're analyzing a Terms & Conditions or Privacy Policy document.

Return ONLY this JSON:

{
  "short_summary": [...],
  "detailed_summary": [...],
  "risk_score": "x/10"
}

Risk Scoring Scheme:
- Data Sharing without consent: +2
- Auto-renewal / payment obligations: +2
- Third-party data access or ads: +2
- Mandatory arbitration / waiver of rights: +1
- Limited account deletion: +1
- Location tracking or biometric usage: +2

Now analyze:
${text}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  const raw = await res.json();
  const cleaned = raw.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(cleaned.replace(/```json|```/g, '').trim());
}
