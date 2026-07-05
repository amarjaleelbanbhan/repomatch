export interface InterestProfile {
  topics: string[];
  languages: string[];
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map((v) => v.toLowerCase()));
  const setB = new Set(b.map((v) => v.toLowerCase()));
  let intersection = 0;
  for (const v of setA) if (setB.has(v)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** FR-6.1: "developers like you" — heuristic similarity via shared topics/languages (no embeddings yet). */
export function computeUserSimilarity(a: InterestProfile, b: InterestProfile): number {
  return jaccard(a.topics, b.topics) * 0.6 + jaccard(a.languages, b.languages) * 0.4;
}
