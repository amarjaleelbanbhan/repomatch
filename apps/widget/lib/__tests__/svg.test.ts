import { describe, expect, it } from "vitest";
import { escapeXml, renderActivityCardSvg, renderMyWorkSvg, renderSetupCardSvg, renderWidgetSvg } from "../svg.js";
import { getThemeColors } from "../theme.js";

describe("escapeXml", () => {
  it("escapes characters that would break XML/SVG parsing", () => {
    expect(escapeXml(`<script>&"'`)).toBe("&lt;script&gt;&amp;&quot;&apos;");
  });
});

describe("renderSetupCardSvg", () => {
  it("escapes the username and stays within the SVG payload budget", () => {
    const svg = renderSetupCardSvg('"><script>alert(1)</script>', getThemeColors("dark"));
    expect(svg).not.toContain("<script>");
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });
});

describe("renderWidgetSvg", () => {
  it("renders one card per match and stays within the SVG payload budget", () => {
    const svg = renderWidgetSvg(
      [
        { fullName: "octocat/hello", description: "demo repo", primaryLanguage: "TypeScript", stars: 42, reason: "matched: typescript" },
        { fullName: "octocat/world", description: "another demo", primaryLanguage: "Python", stars: 7, reason: "matched: python" },
      ],
      getThemeColors("light"),
    );
    expect(svg.match(/<g /g)).toHaveLength(2);
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });
});

describe("renderActivityCardSvg", () => {
  const stats = {
    contributionStreak: 5,
    totalContributions: 320,
    ownedStars: 42,
    topLanguages: ["TypeScript", "Python"],
  };

  it("renders stats even with zero recommendations (FR-4.11 graceful degradation)", () => {
    const svg = renderActivityCardSvg(stats, [], getThemeColors("dark"));
    expect(svg).toContain("5-day streak");
    expect(svg).toContain("320 contributions");
    expect(svg.match(/<g /g)).toBeNull();
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });

  it("renders the next-repo-to-try section when a rec is present", () => {
    const svg = renderActivityCardSvg(
      stats,
      [{ fullName: "octocat/hello", description: "demo", primaryLanguage: "TypeScript", stars: 10, reason: "matched: typescript" }],
      getThemeColors("light"),
    );
    expect(svg).toContain("NEXT REPO TO TRY");
    expect(svg.match(/<g /g)).toHaveLength(1);
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });

  it("escapes malicious language/stat input", () => {
    const svg = renderActivityCardSvg(
      { ...stats, topLanguages: ["<script>alert(1)</script>"] },
      [],
      getThemeColors("dark"),
    );
    expect(svg).not.toContain("<script>alert");
  });
});

describe("renderMyWorkSvg", () => {
  it("renders a fallback when the user has no claimed repos", () => {
    const svg = renderMyWorkSvg([], "octocat", getThemeColors("dark"));
    expect(svg).toContain("hasn't claimed any repos");
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });

  it("renders one card per claimed repo with pitch and help-wanted areas", () => {
    const svg = renderMyWorkSvg(
      [{ fullName: "octocat/hello", pitch: "Come build with us", helpWanted: ["docs", "tests"] }],
      "octocat",
      getThemeColors("light"),
    );
    expect(svg).toContain("Contributors wanted");
    expect(svg.match(/<g /g)).toHaveLength(1);
    expect(new TextEncoder().encode(svg).length).toBeLessThan(15 * 1024);
  });
});
