const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export class GitHubGraphQLError extends Error {
  constructor(
    message: string,
    public readonly errors: unknown,
  ) {
    super(message);
  }
}

function waitBeforeRetry(attempt: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
}

/** C2: all GitHub data acquisition happens here, in the nightly batch job — never in the widget's serving path. */
export async function githubGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS - 1) throw error;
      await waitBeforeRetry(attempt);
      continue;
    }

    if (!response.ok) {
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS - 1) {
        await waitBeforeRetry(attempt);
        continue;
      }
      throw new Error(`GitHub GraphQL request failed: ${response.status} ${await response.text()}`);
    }

    const body = (await response.json()) as { data?: T; errors?: unknown };
    if (body.errors) {
      throw new GitHubGraphQLError("GitHub GraphQL returned errors", body.errors);
    }
    if (!body.data) {
      throw new Error("GitHub GraphQL response missing data");
    }
    return body.data;
  }

  throw new Error("GitHub GraphQL request failed after retries");
}
