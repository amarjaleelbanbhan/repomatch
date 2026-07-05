import type { ThemeColors } from "./theme.js";

export interface RepoCard {
  fullName: string;
  description: string;
  primaryLanguage: string;
  stars: number;
  reason: string;
}

const CARD_HEIGHT = 60;
const CARD_WIDTH = 420;
const PADDING = 16;

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

export function renderWidgetSvg(cards: RepoCard[], colors: ThemeColors): string {
  const height = PADDING * 2 + cards.length * CARD_HEIGHT + Math.max(0, cards.length - 1) * 8;
  const backgroundRect =
    colors.background === "none"
      ? ""
      : `<rect width="${CARD_WIDTH}" height="${height}" fill="${colors.background}" />`;

  const cardMarkup = cards
    .map((card, i) => {
      const y = PADDING + i * (CARD_HEIGHT + 8);
      return `
  <g transform="translate(0, ${y})">
    <rect x="${PADDING}" y="0" width="${CARD_WIDTH - PADDING * 2}" height="${CARD_HEIGHT - 8}" rx="6" fill="none" stroke="${colors.cardBorder}" />
    <text x="${PADDING + 12}" y="20" fill="${colors.title}" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">${escapeXml(truncate(card.fullName, 40))}</text>
    <text x="${PADDING + 12}" y="38" fill="${colors.subtitle}" font-family="-apple-system, sans-serif" font-size="12">${escapeXml(truncate(card.description, 55))}</text>
    <text x="${CARD_WIDTH - PADDING - 12}" y="20" fill="${colors.subtitle}" font-family="-apple-system, sans-serif" font-size="11" text-anchor="end">${escapeXml(card.primaryLanguage)} ★ ${card.stars}</text>
    <text x="${CARD_WIDTH - PADDING - 12}" y="38" fill="${colors.reason}" font-family="-apple-system, sans-serif" font-size="11" text-anchor="end">${escapeXml(truncate(card.reason, 30))}</text>
  </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${backgroundRect}${cardMarkup}
</svg>`;
}

export function renderSetupCardSvg(username: string, colors: ThemeColors): string {
  const height = 90;
  const backgroundRect =
    colors.background === "none"
      ? ""
      : `<rect width="${CARD_WIDTH}" height="${height}" fill="${colors.background}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}">
  ${backgroundRect}
  <text x="${PADDING}" y="36" fill="${colors.title}" font-family="-apple-system, sans-serif" font-size="16" font-weight="600">RepoMatch</text>
  <text x="${PADDING}" y="60" fill="${colors.subtitle}" font-family="-apple-system, sans-serif" font-size="13">Set up matches for @${escapeXml(username)} at repomatch.dev</text>
</svg>`;
}
