// popup.js
import { classifyWithBERT } from "./bertClient.js";
import { getRuleBasedScore } from "./riskScore.js";
import { callGeminiAnalysis } from "./summarize.js";

console.log("✅ Popup script loaded");

const analyzeBtn = document.getElementById("analyzeBtn");
const loadingEl  = document.getElementById("loading");
const resultsEl  = document.getElementById("results");
const errorEl    = document.getElementById("error");

analyzeBtn.addEventListener("click", async () => {
  // 1) show loader
  loadingEl.style.display = "block";
  resultsEl.style.display = "none";
  errorEl.style.display   = "none";

  try {
    // 2) find active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found.");

    // 3) inject to grab full page text
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    const text = injection.result;
    if (!text || text.length < 100) {
      throw new Error("No meaningful content found on this page.");
    }
    console.log("📝 Extracted text length:", text.length);

    // 4) Gemini summary
    let gemini = { short_summary: [], detailed_summary: [], risk_score: null };
    try {
      gemini = await callGeminiAnalysis(text);
      console.log("🤖 Gemini result:", gemini);
    } catch (e) {
      console.warn("⚠️ Gemini failed:", e);
    }

    // 5) BERT classification
    let bert = { top_clauses: [], risk_score: null };
    try {
      bert = await classifyWithBERT(text);
      console.log("🔬 BERT result:", bert);
    } catch (e) {
      console.warn("⚠️ BERT failed:", e);
    }

    // 6) Rule-based fallback
    let fallbackScore = "0/10";
    try {
      fallbackScore = await getRuleBasedScore(text);
      console.log("🛡️ Fallback score:", fallbackScore);
    } catch (e) {
      console.warn("⚠️ Fallback failed:", e);
    }

    // 7) pick final score
    const scoreText = bert.risk_score || gemini.risk_score || fallbackScore;
    const score = parseInt(scoreText.split("/")[0], 10) || 0;
    updateProgressCircle(score);

    // 8) render in DOM
    document.getElementById("gemini-summary").innerHTML =
      (gemini.short_summary || []).map(p => `<li>${p}</li>`).join("") ||
      "<li>No summary available.</li>";

    document.getElementById("bert-summary").innerHTML =
      (bert.top_clauses || []).map(p => `<li>${p}</li>`).join("") ||
      "<li>No BERT results.</li>";

    document.getElementById("gemini-detailed").innerHTML =
      (gemini.detailed_summary || []).map(p => `<li>${p}</li>`).join("") ||
      "<li>No details available.</li>";

    document.getElementById("score-label").innerText = `Final Risk Score: ${score}/10`;
    document.getElementById("toggle-details").onclick = () => {
      const det = document.getElementById("detailed-summary");
      det.style.display = det.style.display === "none" ? "block" : "none";
    };

    // 9) show results
    loadingEl.style.display = "none";
    resultsEl.style.display = "block";

  } catch (err) {
    console.error("❌ Popup error:", err);
    showError(err.message);
  }
});

function showError(msg) {
  loadingEl.style.display = "none";
  resultsEl.style.display = "none";
  errorEl.innerText = msg;
  errorEl.style.display = "block";
}

function updateProgressCircle(score) {
  const percent = Math.min(score * 10, 100);
  const r = 50, c = 2 * Math.PI * r;
  const meter = document.getElementById("progress--circle");
  const text  = document.getElementById("progress--text");
  meter.style.strokeDasharray  = c;
  meter.style.strokeDashoffset = c * (1 - percent / 100);
  text.textContent = `${percent}%`;
}
