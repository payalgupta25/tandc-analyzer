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

      const prompt = `You are analyzing the Terms and Conditions of a website. I want you to return two separate summaries:

      1. short_summary: Just 4–6 short, critical points users must know, like:
      - Your posts being used by Twitter without payment
      - Your data being shared and stored globally
      
      2. Detect presence of key legal policy categories:
   - data_collection
   - data_sharing
   - content_rights
   - account_termination
   - dispute_resolution
   - location_tracking
   - ad_personalization
   - third_party_services
   - arbitration_or_class_waiver

      No intro or explanations — just bullets, 1 line each.

      2. detailed_summary: Expanded, human-friendly summary with clear points. Explain risks like arbitration, data sharing, suspension, etc. Use bullet points or small paragraphs — sound human, not AI. Do not start with any explanation like “Here's the breakdown.” Just the points.

      End both summaries with:
      "If you're privacy-conscious or concerned about these terms, you might want to use this service cautiously."

      Then give:
      Risk Score: x/10

      IMPORTANT: Respond using this JSON format only:
      {
        "short_summary": "...",
        "detailed_summary": "...",
        "risk_score": "x/10"
      }

      Here's the text:
      ${response.text}`;


      const GEMINI_API_KEY = "AIzaSyAqp-kUY8SUXs_Tah7xPgzXjd67sYwyMpk"; // Use securely in production

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
        resultContainer.innerHTML = `
          <div id="short-summary">
            ${gemini.short_summary?.replace(/\n/g, "<br>") || "No short summary found."}
            <br><br><strong>Risk Score:</strong> ${gemini.risk_score || "N/A"}
            <br><br><button id="toggle-details">🔍 View Details</button>
          </div>
          <div id="detailed-summary" style="display:none; margin-top:10px;">
            ${gemini.detailed_summary?.replace(/\n/g, "<br>") || "No detailed summary found."}
          </div>
        `;

        document.getElementById("toggle-details").addEventListener("click", () => {
          const detailed = document.getElementById("detailed-summary");
          detailed.style.display = detailed.style.display === "none" ? "block" : "none";
        });

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


