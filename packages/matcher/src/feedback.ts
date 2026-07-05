const TAG_BOOST = 0.05;
const MAX_ADJUSTMENT = 0.3;

/** FR-5.4: feedback shall influence the next matching cycle by boosting/penalizing similar repos. */
export function computeFeedbackAdjustment(
  repoTags: string[],
  likedTags: string[],
  dislikedTags: string[],
): number {
  const liked = new Set(likedTags.map((t) => t.toLowerCase()));
  const disliked = new Set(dislikedTags.map((t) => t.toLowerCase()));

  let adjustment = 0;
  for (const tag of repoTags) {
    const t = tag.toLowerCase();
    if (liked.has(t)) adjustment += TAG_BOOST;
    if (disliked.has(t)) adjustment -= TAG_BOOST;
  }

  return Math.max(-MAX_ADJUSTMENT, Math.min(MAX_ADJUSTMENT, adjustment));
}
