import type { ThemeColors } from "./theme.js";

export interface RepoCard {
  fullName: string;
  description: string;
  primaryLanguage: string;
  stars: number;
  reason: string;
}

export interface ActivityStats {
  contributionStreak: number;
  totalContributions: number;
  ownedStars: number;
  topLanguages: string[];
}

export interface MyWorkCard {
  fullName: string;
  pitch: string;
  helpWanted: string[];
}

const CARD_HEIGHT = 60;
const CARD_WIDTH = 420;
const PADDING = 16;
const ACCENT_BAR_HEIGHT = 3;
const FONT = "'JetBrains Mono', ui-monospace, 'Segoe UI', -apple-system, sans-serif";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function defs(colors: ThemeColors): string {
  return `<defs><linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${colors.title}" />
    <stop offset="100%" stop-color="${colors.reason}" />
  </linearGradient></defs>`;
}

function frame(colors: ThemeColors, height: number): string {
  const bg =
    colors.background === "none"
      ? ""
      : `<rect width="${CARD_WIDTH}" height="${height}" rx="10" fill="${colors.background}" />`;
  const accentBar = `<rect width="${CARD_WIDTH}" height="${ACCENT_BAR_HEIGHT}" rx="1.5" fill="url(#accentBar)" />`;
  return `${bg}${accentBar}`;
}

function brandTag(colors: ThemeColors, height: number): string {
  return `<text x="${CARD_WIDTH - PADDING}" y="${height - 10}" fill="${colors.subtitle}" font-family="${FONT}" font-size="9" text-anchor="end" opacity="0.7">via RepoMatch</text>`;
}

function repoCardGroup(card: RepoCard, y: number, colors: ThemeColors): string {
  return `
  <g transform="translate(0, ${y})">
    <rect x="${PADDING}" y="0" width="${CARD_WIDTH - PADDING * 2}" height="${CARD_HEIGHT - 8}" rx="8" fill="none" stroke="${colors.cardBorder}" />
    <text x="${PADDING + 12}" y="20" fill="${colors.title}" font-family="${FONT}" font-size="14" font-weight="600">${escapeXml(truncate(card.fullName, 40))}</text>
    <text x="${PADDING + 12}" y="38" fill="${colors.subtitle}" font-family="${FONT}" font-size="12">${escapeXml(truncate(card.description, 55))}</text>
    <text x="${CARD_WIDTH - PADDING - 12}" y="20" fill="${colors.accent}" font-family="${FONT}" font-size="11" text-anchor="end">${escapeXml(card.primaryLanguage)} ★ ${card.stars}</text>
    <text x="${CARD_WIDTH - PADDING - 12}" y="38" fill="${colors.reason}" font-family="${FONT}" font-size="11" text-anchor="end">${escapeXml(truncate(card.reason, 30))}</text>
  </g>`;
}

export function renderWidgetSvg(cards: RepoCard[], colors: ThemeColors): string {
  const height = PADDING * 2 + cards.length * CARD_HEIGHT + Math.max(0, cards.length - 1) * 8;
  const cardMarkup = cards
    .map((card, i) => repoCardGroup(card, PADDING + i * (CARD_HEIGHT + 8), colors))
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${defs(colors)}${frame(colors, height)}${cardMarkup}
</svg>`;
}

export function renderSetupCardSvg(username: string, colors: ThemeColors): string {
  const height = 90;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${defs(colors)}${frame(colors, height)}
  <text x="${PADDING}" y="40" fill="${colors.title}" font-family="${FONT}" font-size="16" font-weight="700">⚡ RepoMatch</text>
  <text x="${PADDING}" y="64" fill="${colors.subtitle}" font-family="${FONT}" font-size="13">Set up matches for @${escapeXml(username)} at repomatch-web.vercel.app</text>
</svg>`;
}

const HEADER_HEIGHT = 92;
const LABEL_HEIGHT = 24;

/**
 * FR-4.8/4.9/4.11: the widget's primary content — the installer's own activity stats — always
 * renders, with the "next repo to try" rec as optional secondary content beneath it.
 */
export function renderActivityCardSvg(
  stats: ActivityStats,
  nextRepos: RepoCard[],
  colors: ThemeColors,
): string {
  const recSectionHeight = nextRepos.length > 0 ? LABEL_HEIGHT + nextRepos.length * CARD_HEIGHT : 0;
  const height = HEADER_HEIGHT + recSectionHeight;

  const streakText = `🔥 ${stats.contributionStreak}-day streak`;
  const statsLine = `${stats.totalContributions} contributions this year  ·  ${stats.ownedStars} ★ across your repos`;
  const languagesLine =
    stats.topLanguages.length > 0 ? `Top languages: ${stats.topLanguages.join(" · ")}` : "";

  const recLabel = nextRepos.length > 1 ? "REPOS TO TRY" : "NEXT REPO TO TRY";
  const recMarkup =
    nextRepos.length > 0
      ? `
  <text x="${PADDING}" y="${HEADER_HEIGHT + 16}" fill="${colors.accent}" font-family="${FONT}" font-size="11" font-weight="700" letter-spacing="1">${recLabel} →</text>
  ${nextRepos.map((repo, i) => repoCardGroup(repo, HEADER_HEIGHT + LABEL_HEIGHT + i * CARD_HEIGHT, colors)).join("")}`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${defs(colors)}${frame(colors, height)}
  <text x="${PADDING}" y="34" fill="${colors.title}" font-family="${FONT}" font-size="19" font-weight="700">${escapeXml(streakText)}</text>
  <text x="${PADDING}" y="56" fill="${colors.subtitle}" font-family="${FONT}" font-size="12">${escapeXml(statsLine)}</text>
  <text x="${PADDING}" y="74" fill="${colors.accent}" font-family="${FONT}" font-size="12">${escapeXml(languagesLine)}</text>${recMarkup}
  ${brandTag(colors, height)}
</svg>`;
}

function myWorkCardGroup(card: MyWorkCard, y: number, colors: ThemeColors): string {
  const helpWantedLine = card.helpWanted.length > 0 ? `Help wanted: ${card.helpWanted.join(", ")}` : "";
  return `
  <g transform="translate(0, ${y})">
    <rect x="${PADDING}" y="0" width="${CARD_WIDTH - PADDING * 2}" height="${CARD_HEIGHT - 8}" rx="8" fill="none" stroke="${colors.cardBorder}" />
    <text x="${PADDING + 12}" y="20" fill="${colors.title}" font-family="${FONT}" font-size="14" font-weight="600">${escapeXml(truncate(card.fullName, 40))}</text>
    <text x="${PADDING + 12}" y="38" fill="${colors.subtitle}" font-family="${FONT}" font-size="12">${escapeXml(truncate(card.pitch, 55))}</text>
    <text x="${CARD_WIDTH - PADDING - 12}" y="38" fill="${colors.accent}" font-family="${FONT}" font-size="11" text-anchor="end">${escapeXml(truncate(helpWantedLine, 35))}</text>
  </g>`;
}

/** FR-4.7: `?type=mywork` — the user's claimed repos, pitched to attract contributors. */
export function renderMyWorkSvg(cards: MyWorkCard[], username: string, colors: ThemeColors): string {
  if (cards.length === 0) {
    const height = 90;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${defs(colors)}${frame(colors, height)}
  <text x="${PADDING}" y="40" fill="${colors.title}" font-family="${FONT}" font-size="16" font-weight="700">⚡ RepoMatch</text>
  <text x="${PADDING}" y="64" fill="${colors.subtitle}" font-family="${FONT}" font-size="13">@${escapeXml(username)} hasn't claimed any repos yet</text>
</svg>`;
  }

  const headerHeight = 40;
  const height = headerHeight + cards.length * CARD_HEIGHT;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${defs(colors)}${frame(colors, height)}
  <text x="${PADDING}" y="28" fill="${colors.title}" font-family="${FONT}" font-size="15" font-weight="700">🤝 Contributors wanted</text>
  ${cards.map((card, i) => myWorkCardGroup(card, headerHeight + i * CARD_HEIGHT, colors)).join("")}
  ${brandTag(colors, height)}
</svg>`;
}
