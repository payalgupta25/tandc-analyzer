// popup.js
import { classifyWithBERT } from "./bertClient.js";
import { getRuleBasedScore } from "./riskScore.js";
import { callGeminiAnalysis } from "./summarize.js";

const analyzeBtn = document.getElementById("analyzeBtn");
const loadingEl  = document.getElementById("loading");
const resultsEl  = document.getElementById("results");
const errorEl    = document.getElementById("error");

analyzeBtn.addEventListener("click", async () => {
  // 1️⃣ Reset UI
  loadingEl.style.display = "block";
  resultsEl.style.display = "none";
  errorEl.style.display   = "none";
  clearUI();

  try {
    // 2️⃣ Grab page text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found.");
    const [inj] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });
    const text = inj.result;
    if (!text || text.length < 100) throw new Error("No meaningful content on this page.");

    // 3️⃣ Immediate rule‐based score
    const fallbackScore = getRuleBasedScore(text);
    const fallbackVal   = parseInt(fallbackScore, 10) || 0;

    // 4️⃣ Await BERT next (blocked)
    let bert = { top_clauses: [], risk_score: "0/10" };
    try {
      bert = await classifyWithBERT(text);
    } catch (e) {
      console.warn("⚠️ BERT failed:", e);
    }
    const bertVal = parseInt(bert.risk_score, 10) || 0;

    // 5️⃣ Compute locked “final” score
    const lockedScore = Math.max(fallbackVal, bertVal);
    document.getElementById("score-label").innerText = `Risk Score: ${lockedScore}/10`;
    updateProgressCircle(lockedScore);

    // Render BERT clauses immediately
    document.getElementById("bert-summary").innerHTML =
      bert.top_clauses.map(p => `<li>${p}</li>`).join("") ||
      "<li>No BERT results</li>";

    // 6️⃣ Show results container
    resultsEl.style.display = "block";
    loadingEl.style.display = "none";

    // 7️⃣ Fire Gemini in background—ONLY fill in summaries, **no gauge update**
    callGeminiAnalysis(text)
      .then(gemini => {
        document.getElementById("gemini-summary").innerHTML =
          (gemini.short_summary || []).map(p => `<li>${p}</li>`).join("") ||
          "<li>No Gemini summary</li>";

        document.getElementById("gemini-detailed").innerHTML =
          (gemini.detailed_summary || []).map(p => `<li>${p}</li>`).join("") ||
          "<li>No details available</li>";
      })
      .catch(err => console.warn("⚠️ Gemini failed:", err));

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
