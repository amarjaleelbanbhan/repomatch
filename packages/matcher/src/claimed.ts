const CLAIMED_BOOST = 0.05;

/** FR-6.3: claimed repos (verified maintainer engagement) get a small score boost. */
export function computeClaimedBoost(isClaimed: boolean): number {
  return isClaimed ? CLAIMED_BOOST : 0;
}
