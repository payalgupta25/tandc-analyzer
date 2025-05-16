
## 📄 `README.md`

# 🛡️ T&C Privacy Analyzer Chrome Extension

This Chrome Extension automatically analyzes **Terms & Conditions** or **Privacy Policy** pages using a hybrid AI approach combining:

- 🌐 **Gemini (LLM)** – for human-friendly summarization
- 🤖 **BERT Classifier** – for clause-level risk tagging
- ⚠️ **Rule-based fallback** – to score even without ML

It provides a clean summary, highlights risks, and assigns a **final privacy risk score** (0–10) with a visual progress ring.

---

## 🚀 Features

- ✅ Extracts text from any website's T&C or privacy policy page
- ✅ Summarizes content using Google Gemini LLM
- ✅ Classifies risky clauses with BERT (hosted locally via Flask)
- ✅ Fallback keyword-based scoring (for offline/backup)
- ✅ Visual UI with collapsible summaries
- ✅ Fully modular and customizable

---

## 📁 Folder Structure



tandc-analyzer/
├── backend/                 # Flask API + BERT classifier
│   ├── app.py
│   ├── classifier.py
│   ├── config.yaml
│   ├── risk\_score.py
│   ├── requirements.txt
│   └── **init**.py
│
├── extension/               # Chrome extension (frontend)
│   ├── popup.html
│   ├── popup.js
│   ├── summarize.js
│   ├── bertClient.js
│   ├── riskScore.js
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   ├── style.css
│   ├── flaggedPhrases.json
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
└── README.md



---

## ⚙️ Setup Instructions

### 🔧 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourname/tandc-analyzer.git
cd tandc-analyzer/backend
python -m venv venv
venv\Scripts\activate  # or `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
````

### 🔄 2. Run the Backend (Flask API)

```bash
python app.py
```

Your BERT-based classifier will be available at:

```
http://localhost:5000/classify
```

---

### 🧩 3. Set Your Gemini API Key

Open `extension/summarize.js` and **replace**:

```js
const GEMINI_API_KEY = "<YOUR_GEMINI_KEY>";
```

with your real [Gemini API key](https://aistudio.google.com/app/apikey).

---

## 🌐 4. Load the Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🧪 5. Test on Any Website

* Navigate to any website with a Terms or Privacy Policy.
* Click the extension icon.
* Hit **"Analyze This Page"**
* ✅ See:

  * Gemini-generated summary
  * BERT-detected risky clauses
  * Final risk score with progress ring

---



## 📌 Notes

* Gemini API requires a Google Cloud billing-enabled account (free tier OK)
* The extension supports fallback scoring using `flaggedPhrases.json` in case AI is unreachable
* Extension is Manifest V3 compliant

---



