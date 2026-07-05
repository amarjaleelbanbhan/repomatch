export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  userId: string;
  languages: string[];
  topics: string[];
  starredRepoIds: string[];
  ownedRepoIds: string[];
  hiddenRepoIds: string[];
  skillLevel: SkillLevel;
}

export interface CandidateRepo {
  repoId: string;
  languages: string[];
  topics: string[];
  healthScore: number;
  hasGoodFirstIssues: boolean;
  hasContributing: boolean;
}

export interface MatchResult {
  repoId: string;
  score: number;
  reason: string;
}
