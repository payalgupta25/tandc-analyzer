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
  // 1) Reset & show loader
  resultsEl.style.display = "none";
  errorEl.style.display   = "none";
  loadingEl.style.display = "block";
  clearUI();

  try {
    // 2) Grab page text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found.");

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });
    const text = injection.result;
    if (!text || text.length < 100) {
      throw new Error("No meaningful content found on this page.");
    }

    // 3) Show immediate fallback score
    const fallbackScore = getRuleBasedScore(text);            // synchronous
    const fallbackValue = parseInt(fallbackScore, 10) || 0;
    document.getElementById("score-label").innerText = `Prelim Score: ${fallbackValue}/10`;
    updateProgressCircle(fallbackValue);
    resultsEl.style.display = "block";
    loadingEl.style.display = "none";

    // 4) Kick off BERT (async)
    classifyWithBERT(text)
      .then(bert => {
        // render BERT clauses
        document.getElementById("bert-summary").innerHTML =
          (bert.top_clauses || []).map(p => `<li>${p}</li>`).join("") ||
          "<li>No BERT results.</li>";

        // update score if BERT is higher
        const bertValue = parseInt(bert.risk_score, 10) || 0;
        const newPrelim = Math.max(fallbackValue, bertValue);
        document.getElementById("score-label").innerText = `Prelim Score: ${newPrelim}/10`;
        updateProgressCircle(newPrelim);
      })
      .catch(err => {
        console.warn("⚠️ BERT failed:", err);
      });

    // 5) Kick off Gemini (async)
    callGeminiAnalysis(text)
      .then(gemini => {
        // render Gemini summaries
        document.getElementById("gemini-summary").innerHTML =
          (gemini.short_summary || []).map(p => `<li>${p}</li>`).join("") ||
          "<li>No Gemini summary.</li>";
        document.getElementById("gemini-detailed").innerHTML =
          (gemini.detailed_summary || []).map(p => `<li>${p}</li>`).join("") ||
          "<li>No details available.</li>";

        // compute final score = max(fallback, BERT, Gemini)
        const gemValue  = parseInt(gemini.risk_score, 10) || 0;
        const bertScore = parseInt(document.getElementById("score-label").innerText.split(" ")[2], 10) || 0;
        const finalValue = Math.max(fallbackValue, bertScore, gemValue);

        document.getElementById("score-label").innerText = `Final Score: ${finalValue}/10`;
        updateProgressCircle(finalValue);
      })
      .catch(err => {
        console.warn("⚠️ Gemini failed:", err);
      });

  } catch (err) {
    console.error("❌ Popup error:", err);
    showError(err.message);
  }
});

function clearUI() {
  document.getElementById("bert-summary").innerHTML = "";
  document.getElementById("gemini-summary").innerHTML = "";
  document.getElementById("gemini-detailed").innerHTML = "";
  document.getElementById("score-label").innerText = "";
}

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
