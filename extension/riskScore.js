import flaggedPhrases from './flaggedPhrases.json' assert { type: 'json' };

export function getRuleBasedScore(text) {
  let score = 0;
  text = text.toLowerCase();

  flaggedPhrases.forEach(entry => {
    if (text.includes(entry.phrase.toLowerCase())) {
      score += entry.weight;
    }
  });

  return `${Math.min(score, 10)}/10`;
}
