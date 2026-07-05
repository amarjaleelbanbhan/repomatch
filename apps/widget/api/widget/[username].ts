export const config = { runtime: "edge" };

function fallbackSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <rect width="400" height="120" rx="8" fill="#0d1117" />
  <text x="20" y="45" fill="#c9d1d9" font-family="sans-serif" font-size="16">RepoMatch</text>
  <text x="20" y="75" fill="#8b949e" font-family="sans-serif" font-size="13">Set up matches for @${username} at repomatch.dev</text>
</svg>`;
}

export default function handler(request: Request): Response {
  const url = new URL(request.url);
  const username = url.pathname.split("/").pop()?.replace(/\.svg$/, "") ?? "";

  const svg = fallbackSvg(username);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
