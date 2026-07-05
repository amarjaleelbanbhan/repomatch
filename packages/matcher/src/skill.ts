import type { SkillLevel } from "./types.js";

const GFI_BOOST = 0.08;
const CONTRIBUTING_BOOST = 0.04;

/** FR-3.7: beginners are biased toward repos with good-first-issues and a CONTRIBUTING.md. */
export function computeSkillAdjustment(
  skillLevel: SkillLevel,
  hasGoodFirstIssues: boolean,
  hasContributing: boolean,
): number {
  if (skillLevel !== "beginner") return 0;

  let adjustment = 0;
  if (hasGoodFirstIssues) adjustment += GFI_BOOST;
  if (hasContributing) adjustment += CONTRIBUTING_BOOST;
  return adjustment;
}
