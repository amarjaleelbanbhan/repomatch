import { describe, expect, it } from "vitest";
import { escapeXml, renderSetupCardSvg, renderWidgetSvg } from "../svg.js";
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
