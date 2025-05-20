import { classifyWithBERT } from "/bertClient.js";
import { getRuleBasedScore } from "/riskScore.js";
import { callGeminiAnalysis } from "/summarize.js";
// import flaggedPhrases from "./flaggedPhrases.json" assert { type: "json" };

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const loading = document.getElementById("loading");
  const results = document.getElementById("results");
  const error = document.getElementById("error");

  loading.style.display = "block";
  results.style.display = "none";
  error.style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, async (response) => {
      const text = response?.text;

      if (!text || text.length < 100) {
        throw new Error("No meaningful content found.");
      }

      // 🔍 1. Gemini LLM summary
      const gemini = await callGeminiAnalysis(text);

      // 🤖 2. BERT classification
      const bert = await classifyWithBERT(text);

      // 🛡️ 3. Optional rule-based backup
      const fallbackScore = getRuleBasedScore(text);
      console.log(bert);
      console.log(gemini);
      console.log(fallbackScore);
      // 🧠 4. Final risk score logic
      const scoreText = bert?.risk_score || gemini?.risk_score || fallbackScore || "0/10";
      const score = parseInt(scoreText.split("/")[0]) || 0;
      updateProgressCircle(score);

      // 🧾 5. Display output
      document.getElementById("gemini-summary").innerHTML = gemini.short_summary.map(p => `<li>${p}</li>`).join('');
      document.getElementById("bert-summary").innerHTML = bert.top_clauses.map(p => `<li>${p}</li>`).join('');
      document.getElementById("gemini-detailed").innerHTML = gemini.detailed_summary.map(p => `<li>${p}</li>`).join('');
      document.getElementById("score-label").innerText = `🧠 Final Risk Score: ${score}/10`;

      document.getElementById("toggle-details").onclick = () => {
        const section = document.getElementById("detailed-summary");
        section.style.display = section.style.display === "none" ? "block" : "none";
      };

      loading.style.display = "none";
      results.style.display = "block";
    });
  } catch (err) {
    console.error("❌", err);
    error.style.display = "block";
    error.innerText = `❌ ${err.message}`;
    loading.style.display = "none";
  }
});

// --- Circle progress animation ---
function updateProgressCircle(score) {
  const percent = Math.min(score * 10, 100);
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const meter = document.getElementById("progress--circle");
  const text = document.getElementById("progress--text");

  meter.style.strokeDasharray = circumference;
  meter.style.strokeDashoffset = circumference * (1 - percent / 100);
  text.textContent = `${percent}%`;
}
