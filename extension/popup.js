<<<<<<< HEAD
import { classifyWithBERT } from "/bertClient.js";
import { getRuleBasedScore } from "/riskScore.js";
import { callGeminiAnalysis } from "/summarize.js";
// import flaggedPhrases from "./flaggedPhrases.json" assert { type: "json" };
=======
import { classifyWithBERT } from "./bertClient.js";
import { getRuleBasedScore } from "./riskScore.js";
import { callGeminiAnalysis } from "./summarize.js";
import flaggedPhrases from "./flaggedPhrases.json" assert { type: "json" };
>>>>>>> f160765ff7957f6549cc3472ac067cef6e4f5867

console.log("✅ Popup script loaded");

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const loading = document.getElementById("loading");
  const results = document.getElementById("results");
  const error = document.getElementById("error");

  loading.style.display = "block";
  results.style.display = "none";
  error.style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error("❌ No active tab found.");
    }

    chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Content script error:", chrome.runtime.lastError.message);
        error.innerText = `❌ Could not access this page.`;
        loading.style.display = "none";
        error.style.display = "block";
        return;
      }

      const text = response?.text;
      if (!text || text.length < 100) {
        throw new Error("❌ No meaningful content found on the page.");
      }

      console.log("📝 Extracted text length:", text.length);

      // 🔍 Gemini summarization
      let gemini = { short_summary: [], detailed_summary: [], risk_score: null };
      try {
        gemini = await callGeminiAnalysis(text);
        console.log("🤖 Gemini summary:", gemini);
      } catch (err) {
        console.warn("⚠️ Gemini failed:", err);
      }

      // 🧠 BERT classification
      let bert = { top_clauses: [], risk_score: null };
      try {
        bert = await classifyWithBERT(text);
        console.log("🔬 BERT result:", bert);
      } catch (err) {
        console.warn("⚠️ BERT failed:", err);
      }

      // 🛡️ Rule-based fallback
      const fallbackScore = getRuleBasedScore(text);
<<<<<<< HEAD
      console.log(bert);
      console.log(gemini);
      console.log(fallbackScore);
      // 🧠 4. Final risk score logic
=======
      console.log("🛡️ Rule-based score:", fallbackScore);

      // 🧠 Final score
>>>>>>> f160765ff7957f6549cc3472ac067cef6e4f5867
      const scoreText = bert?.risk_score || gemini?.risk_score || fallbackScore || "0/10";
      const score = parseInt(scoreText.split("/")[0]) || 0;
      updateProgressCircle(score);

      // 🎯 Update UI
      document.getElementById("gemini-summary").innerHTML =
        gemini.short_summary.map(p => `<li>${p}</li>`).join('') || "<li>No summary</li>";

      document.getElementById("bert-summary").innerHTML =
        bert.top_clauses.map(p => `<li>${p}</li>`).join('') || "<li>No BERT results</li>";

      document.getElementById("gemini-detailed").innerHTML =
        gemini.detailed_summary.map(p => `<li>${p}</li>`).join('') || "<li>No details available</li>";

      document.getElementById("score-label").innerText = `🧠 Final Risk Score: ${score}/10`;

      document.getElementById("toggle-details").onclick = () => {
        const section = document.getElementById("detailed-summary");
        section.style.display = section.style.display === "none" ? "block" : "none";
      };

      loading.style.display = "none";
      results.style.display = "block";
    });
  } catch (err) {
    console.error("❌ Popup error:", err);
    error.innerText = err.message;
    loading.style.display = "none";
    error.style.display = "block";
  }
});

// 🎯 Visual ring update
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
