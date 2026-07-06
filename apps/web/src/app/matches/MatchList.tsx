"use client";

import { useMemo, useState } from "react";
import { submitFeedback } from "./actions";
import { Button, Select, Checkbox, Badge, Card } from "@/components/ui";

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
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap" }}>
        <Select
          label="Language"
          options={[{ value: "all", label: "All languages" }, ...languages.map((l) => ({ value: l, label: l }))]}
          value={language}
          onChange={setLanguage}
          style={{ maxWidth: 220 } as React.CSSProperties}
        />
        <div style={{ paddingBottom: 2 }}>
          <Checkbox
            label="Welcoming repos only (has CONTRIBUTING.md)"
            checked={welcomingOnly}
            onChange={setWelcomingOnly}
          />
        </div>
      </div>

      {/* Match cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((match) => (
          <Card key={match.repoId}>
            <Card.Header>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 className="rm-card__title">{match.fullName}</h3>
                {match.isClaimed && (
                  <Badge variant="success">✓ actively welcoming</Badge>
                )}
                {match.hasContributing && !match.isClaimed && (
                  <Badge variant="info">has CONTRIBUTING.md</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                {match.description || "No description available."}
              </p>
              <p style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.875rem" }}>
                {match.reason}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {match.languages.map((l) => (
                  <Badge key={l} variant="secondary" size="sm">{l}</Badge>
                ))}
                <Badge variant="secondary" size="sm">★ {match.stars.toLocaleString()}</Badge>
                <Badge variant="secondary" size="sm">health {match.healthScore.toFixed(0)}</Badge>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => react(match.repoId, "up")}
                aria-label="Upvote this repository"
              >
                👍 Looks good
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => react(match.repoId, "down")}
                aria-label="Downvote this repository"
              >
                👎 Not for me
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => react(match.repoId, "known")}
              >
                Already know it
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => react(match.repoId, "hide")}
              >
                Hide
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--text-muted)", marginTop: 32, textAlign: "center" }}>
          No matches left with these filters.
        </p>
      )}
    </div>
  );
}
