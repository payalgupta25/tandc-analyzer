let flaggedPhrases = [];

export async function getRuleBasedScore(text) {
  if (flaggedPhrases.length === 0) {
    const res = await fetch(chrome.runtime.getURL("flaggedPhrases.json"));
    flaggedPhrases = await res.json();
  }

  let score = 0;
  text = text.toLowerCase();

  flaggedPhrases.forEach(entry => {
    if (text.includes(entry.phrase.toLowerCase())) {
      score += entry.weight;
    }
  });

  return `${Math.min(score, 10)}/10`;
}

