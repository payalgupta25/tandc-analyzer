document.getElementById("analyzeBtn").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error("No active tab found");
    }

    chrome.tabs.sendMessage(tab.id, { action: "getPageText" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError.message);
        document.getElementById("result").innerHTML = "❌ Could not connect to the page. Try refreshing the page.";
        return;
      }

      if (!response || !response.text) {
        document.getElementById("result").innerHTML = "❌ No content found on this page.";
        return;
      }

  //     const prompt = `You are analyzing the Terms and Conditions of a website. I want you to return two separate summaries:

  //     1. short_summary: Just 4–6 short, critical points users must know, like:
  //     - Your posts being used by Twitter without payment
  //     - Your data being shared and stored globally
      
  //     2. Detect presence of key legal policy categories:
  //  - data_collection
  //  - data_sharing
  //  - content_rights
  //  - account_termination
  //  - dispute_resolution
  //  - location_tracking
  //  - ad_personalization
  //  - third_party_services
  //  - arbitration_or_class_waiver

  //     No intro or explanations — just bullets, 1 line each.

  //     2. detailed_summary: Expanded, human-friendly summary with clear points. Explain risks like arbitration, data sharing, suspension, etc. Use bullet points or small paragraphs — sound human, not AI. Do not start with any explanation like “Here's the breakdown.” Just the points.

  //     End both summaries with:
  //     "If you're privacy-conscious or concerned about these terms, you might want to use this service cautiously."

  //     Then give:
  //     Risk Score: x/10

  //     IMPORTANT: Respond using this JSON format only:
  //     {
  //       "short_summary": "...",
  //       "detailed_summary": "...",
  //       "risk_score": "x/10"
  //     }

  //     Here's the text:
  //     ${response.text}`;

  const prompt = `You're analyzing a Terms & Conditions or Privacy Policy document.

Return ONLY this JSON:

{
  "short_summary": [ // 4–6 critical RISKS only
    "...",  // e.g. "Your personal data may be shared with third parties."
    "...",  // e.g. "Service may auto-renew and charge you without reminders."
  ],
  
  "detailed_summary": [
    "...",  // Detailed human-readable explanation
    "...",  // Include both risky and useful features
  ],

  "risk_score": "x/10"  // Use consistent logic below
}

Risk Scoring Scheme:
- Data Sharing without consent: +2
- Auto-renewal / payment obligations: +2
- Third-party data access or ads: +2
- Mandatory arbitration / waiver of rights: +1
- Limited account deletion: +1
- Location tracking or biometric usage: +2

Final score = sum of these (max 10). Respond ONLY in JSON.

Now analyze:
${response.text}
`;


const GEMINI_API_KEY = "AIzaSyAqp-kUY8SUXs_Tah7xPgzXjd67sYwyMpk";

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanedText = rawText.replace(/```json|```/g, '').trim();
        const gemini = JSON.parse(cleanedText);


        const resultContainer = document.getElementById("result");
        // resultContainer.innerHTML = `
        //   <div id="short-summary">
        //     ${gemini.short_summary?.replace(/\n/g, "<br>") || "No short summary found."}
        //     <br><br><strong>Risk Score:</strong> ${gemini.risk_score || "N/A"}
        //     <br><br><button id="toggle-details">🔍 View Details</button>
        //   </div>
        //   <div id="detailed-summary" style="display:none; margin-top:10px;">
        //     ${gemini.detailed_summary?.replace(/\n/g, "<br>") || "No detailed summary found."}
        //   </div>
        // `;
        resultContainer.innerHTML = `
  <div id="result-card">
    <h4>⚠️ Key Risk Points</h4>
    <ul id="short-summary">
      ${gemini.short_summary?.map(p => `<li>${p}</li>`).join('') || "<li>No short summary found.</li>"}
    </ul>
    <br><strong>Risk Score:</strong> ${gemini.risk_score || "N/A"}
    <br><br><button id="toggle-details">📖 View Detailed Summary</button>

    <div id="detailed-summary" style="display:none; margin-top:15px;">
      <h4>📝 Full Policy Highlights</h4>
      <ul>
        ${gemini.detailed_summary?.map(p => `<li>${p}</li>`).join('') || "<li>No detailed summary found.</li>"}
      </ul>
    </div>
  </div>
`;


        document.getElementById("toggle-details").addEventListener("click", () => {
          const detailed = document.getElementById("detailed-summary");
          detailed.style.display = detailed.style.display === "none" ? "block" : "none";
        });

        
        const scoreText = gemini.risk_score || "0/10";
        const scoreValue = parseInt(scoreText.split("/")[0]) || 0;
        const percent = Math.min(scoreValue * 10, 100);

        const r = 50;
        const circumference = 2 * Math.PI * r;

        const meter = document.getElementById("progress--circle");
        const insideText = document.getElementById("progress--text");

        meter.style.strokeDasharray = circumference;
        meter.style.strokeDashoffset = circumference * (1 - percent / 100);
        insideText.textContent = `${percent}%`;

      } catch (apiError) {
        console.error("Gemini API error:", apiError);
        document.getElementById("result").innerHTML = "❌ Error contacting Gemini API.";
      }
    });
  } catch (error) {
    console.error("Extension error:", error);
    document.getElementById("result").innerHTML = "❌ Something went wrong.";
  }
});


