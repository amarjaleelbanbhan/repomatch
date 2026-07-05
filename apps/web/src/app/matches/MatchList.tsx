"use client";

import { useMemo, useState } from "react";
import { submitFeedback } from "./actions";

export interface Match {
  repoId: string;
  fullName: string;
  description: string;
  languages: string[];
  stars: number;
  healthScore: number;
  hasContributing: boolean;
  isClaimed: boolean;
  reason: string;
  rank: number;
  feedback: string | null;
}

interface Props {
  matches: Match[];
}

export function MatchList({ matches }: Props) {
  const [language, setLanguage] = useState("all");
  const [welcomingOnly, setWelcomingOnly] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const languages = useMemo(
    () => [...new Set(matches.flatMap((m) => m.languages))].sort(),
    [matches],
  );

  const filtered = matches
    .filter((m) => !hiddenIds.has(m.repoId))
    .filter((m) => language === "all" || m.languages.includes(language))
    .filter((m) => !welcomingOnly || m.hasContributing);

  async function react(repoId: string, signal: "up" | "down" | "known" | "hide") {
    if (signal === "hide" || signal === "known") {
      setHiddenIds((prev) => new Set(prev).add(repoId));
    }
    await submitFeedback(repoId, signal);
  }

  return (
    <div>
      <div>
        <label>
          Language:{" "}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="all">All</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        {"  "}
        <label>
          <input
            type="checkbox"
            checked={welcomingOnly}
            onChange={(e) => setWelcomingOnly(e.target.checked)}
          />
          Welcoming repos only (has CONTRIBUTING.md)
        </label>
      </div>

      {filtered.map((match) => (
        <section key={match.repoId}>
          <h2>
            {match.fullName} {match.isClaimed && <span className="chip">✓ actively welcoming</span>}
          </h2>
          <p>{match.description || "No description available."}</p>
          <p>
            {match.languages.join(", ")} · ★ {match.stars} · health {match.healthScore.toFixed(0)}
            {match.hasContributing ? " · has CONTRIBUTING.md" : ""}
          </p>
          <p>{match.reason}</p>
          <div>
            <button type="button" onClick={() => react(match.repoId, "up")}>
              👍
            </button>
            <button type="button" onClick={() => react(match.repoId, "down")}>
              👎
            </button>
            <button type="button" onClick={() => react(match.repoId, "known")}>
              Already know it
            </button>
            <button type="button" onClick={() => react(match.repoId, "hide")}>
              Hide
            </button>
          </div>
        </section>
      ))}

      {filtered.length === 0 && <p>No matches left with these filters.</p>}
    </div>
  );
}
