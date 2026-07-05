const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export class GitHubGraphQLError extends Error {
  constructor(
    message: string,
    public readonly errors: unknown,
  ) {
    super(message);
  }
}

/** C2: all GitHub data acquisition happens here, in the nightly batch job — never in the widget's serving path. */
export async function githubGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
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
