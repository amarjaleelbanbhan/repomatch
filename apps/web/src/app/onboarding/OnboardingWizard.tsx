"use client";

import { useState } from "react";
import { saveOnboarding } from "./actions";
import { Button, Input, Badge, BadgeGroup, RadioGroup, Radio } from "@/components/ui";

type SkillLevel = "beginner" | "intermediate" | "advanced";

interface Props {
  suggestedLanguages: string[];
  suggestedTopics: string[];
  initialSkillLevel: SkillLevel;
}

const EXTRA_TOPIC_SUGGESTIONS = [
  "web",
  "cli",
  "machine-learning",
  "devtools",
  "api",
  "game-dev",
  "data-science",
  "security",
];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** FR-1.3/1.4: 3 steps (interests, skill level, review), designed to complete in under 2 minutes. */
export function OnboardingWizard({ suggestedLanguages, suggestedTopics, initialSkillLevel }: Props) {
  const [step, setStep] = useState(1);
  const [languages, setLanguages] = useState<string[]>(suggestedLanguages);
  const [topics, setTopics] = useState<string[]>(suggestedTopics);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initialSkillLevel);
  const [customTopic, setCustomTopic] = useState("");

  const topicOptions = [...new Set([...suggestedTopics, ...EXTRA_TOPIC_SUGGESTIONS])];
  const canProceedStep1 = topics.length >= 3 && topics.length <= 10;

  return (
    <form action={saveOnboarding}>
      {languages.map((lang) => (
        <input key={lang} type="hidden" name="languages" value={lang} />
      ))}
      {topics.map((topic) => (
        <input key={topic} type="hidden" name="topics" value={topic} />
      ))}
      <input type="hidden" name="skillLevel" value={skillLevel} />

      {step === 1 && (
        <section>
          <h2>Step 1 of 3 — Pick 3 to 10 interests</h2>
          <p>Detected from your public repos and stars. Add or remove as you like.</p>
          <BadgeGroup style={{ margin: "16px 0" } as React.CSSProperties}>
            {topicOptions.map((topic) => (
              <button
                type="button"
                key={topic}
                // Keep .chip for selected visual — using aria-pressed + chip global class as before
                className="chip"
                aria-pressed={topics.includes(topic)}
                onClick={() => setTopics((t) => toggle(t, topic))}
              >
                {topics.includes(topic) ? "✓ " : ""}
                {topic}
              </button>
            ))}
          </BadgeGroup>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 16 }}>
            <Input
              label="Add a custom interest"
              placeholder="e.g. embedded-systems"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              style={{ maxWidth: 280 } as React.CSSProperties}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const value = customTopic.trim().toLowerCase();
                if (value && !topics.includes(value)) setTopics((t) => [...t, value]);
                setCustomTopic("");
              }}
            >
              Add
            </Button>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {topics.length} selected (min 3, max 10)
          </p>
          <Button type="button" variant="primary" disabled={!canProceedStep1} onClick={() => setStep(2)}>
            Next →
          </Button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>Step 2 of 3 — Skill level</h2>
          <RadioGroup
            name="skillLevelChoice"
            value={skillLevel}
            onChange={(v) => setSkillLevel(v as SkillLevel)}
            label="Select your experience level"
            direction="vertical"
          >
            <Radio value="beginner" label="Beginner — new to open source or the ecosystem" />
            <Radio value="intermediate" label="Intermediate — comfortable with PRs and code review" />
            <Radio value="advanced" label="Advanced — maintainer-level experience" />
          </RadioGroup>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="button" variant="primary" onClick={() => setStep(3)}>
              Next →
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>Step 3 of 3 — Review</h2>
          <p style={{ marginBottom: 8 }}>Your interests:</p>
          <BadgeGroup style={{ marginBottom: 16 } as React.CSSProperties}>
            {topics.map((t) => (
              <Badge key={t} variant="primary">{t}</Badge>
            ))}
          </BadgeGroup>
          <p>
            Skill level:{" "}
            <Badge variant="info">{skillLevel}</Badge>
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button type="submit" variant="primary">
              Save and continue
            </Button>
          </div>
        </section>
      )}
    </form>
  );
}
