import { computeHealthScore } from "@repomatch/matcher";
import { githubGraphQL } from "./github.js";

// FR-2.2: cold-start candidate corpus is seeded by language, since there's no user interest
// signal yet to drive targeted search terms. Chosen for relevance to the newcomer audience (P1).
export const CANDIDATE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
];

const SEARCH_QUERY = `
  query SearchRepos($query: String!, $first: Int!) {
    search(query: $query, type: REPOSITORY, first: $first) {
      nodes {
        ... on Repository {
          databaseId
          nameWithOwner
          description
          primaryLanguage { name }
          repositoryTopics(first: 10) { nodes { topic { name } } }
          stargazerCount
          forkCount
          issues(states: OPEN) { totalCount }
          gfi: issues(states: OPEN, labels: ["good first issue"]) { totalCount }
          isArchived
          isFork
          pushedAt
          contributing: object(expression: "HEAD:CONTRIBUTING.md") { id }
        }
      }
    }
  }
`;

interface RawRepoNode {
  databaseId: number | null;
  nameWithOwner: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  stargazerCount: number;
  forkCount: number;
  issues: { totalCount: number };
  gfi: { totalCount: number };
  isArchived: boolean;
  isFork: boolean;
  pushedAt: string | null;
  contributing: { id: string } | null;
}

interface SearchResponse {
  search: { nodes: RawRepoNode[] };
}

export interface IndexedRepo {
  githubId: number;
  fullName: string;
  description: string | null;
  languages: string[];
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  gfiCount: number;
  hasContributing: boolean;
  healthScore: number;
  lastCommitAt: string | null;
}

/** FR-2.2 inclusion criteria, applied client-side since GitHub search has no "open issues > N" qualifier. */
export function isEligibleRepo(node: RawRepoNode): boolean {
  return (
    node.databaseId !== null &&
    !node.isArchived &&
    !node.isFork &&
    node.issues.totalCount >= 1 &&
    node.pushedAt !== null
  );
}

/** FR-2.3: maps a raw GraphQL node to our storage shape, computing the health score. */
export function mapToIndexedRepo(node: RawRepoNode, now: Date): IndexedRepo {
  const pushedAt = new Date(node.pushedAt!);
  const daysSincePush = Math.max(0, (now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    githubId: node.databaseId!,
    fullName: node.nameWithOwner,
    description: node.description,
    languages: node.primaryLanguage ? [node.primaryLanguage.name] : [],
    topics: node.repositoryTopics.nodes.map((t) => t.topic.name),
    stars: node.stargazerCount,
    forks: node.forkCount,
    openIssues: node.issues.totalCount,
    gfiCount: node.gfi.totalCount,
    hasContributing: node.contributing !== null,
    healthScore: computeHealthScore({
      daysSincePush,
      openIssues: node.issues.totalCount,
      stars: node.stargazerCount,
      forks: node.forkCount,
      isArchived: node.isArchived,
    }),
    lastCommitAt: node.pushedAt,
  };
}

function buildSearchQuery(language: string, pushedSince: string): string {
  return `language:${language} pushed:>${pushedSince} stars:>=10 archived:false fork:false is:public`;
}

/** FR-2.1: batched GraphQL fetch across a fixed set of languages, one search per language. */
export async function searchCandidateRepos(token: string, perLanguage = 50): Promise<IndexedRepo[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const pushedSince = cutoff.toISOString().slice(0, 10);

  const results: IndexedRepo[] = [];
  const seen = new Set<number>();

  for (const language of CANDIDATE_LANGUAGES) {
    const query = buildSearchQuery(language, pushedSince);
    const data = await githubGraphQL<SearchResponse>(token, SEARCH_QUERY, {
      query,
      first: perLanguage,
    });

    for (const node of data.search.nodes) {
      if (!isEligibleRepo(node) || seen.has(node.databaseId!)) continue;
      seen.add(node.databaseId!);
      results.push(mapToIndexedRepo(node, now));
    }
  }

  return results;
}
