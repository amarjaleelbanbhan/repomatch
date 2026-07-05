"use client";

import { useState } from "react";
import { saveOnboarding } from "./actions";

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
          <div>
            {topicOptions.map((topic) => (
              <button
                type="button"
                key={topic}
                aria-pressed={topics.includes(topic)}
                onClick={() => setTopics((t) => toggle(t, topic))}
              >
                {topics.includes(topic) ? "✓ " : ""}
                {topic}
              </button>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Add a custom interest"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const value = customTopic.trim().toLowerCase();
                if (value && !topics.includes(value)) setTopics((t) => [...t, value]);
                setCustomTopic("");
              }}
            >
              Add
            </button>
          </div>
          <p>{topics.length} selected</p>
          <button type="button" disabled={!canProceedStep1} onClick={() => setStep(2)}>
            Next
          </button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>Step 2 of 3 — Skill level</h2>
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
            <label key={level}>
              <input
                type="radio"
                name="skillLevelChoice"
                checked={skillLevel === level}
                onChange={() => setSkillLevel(level)}
              />
              {level}
            </label>
          ))}
          <button type="button" onClick={() => setStep(1)}>
            Back
          </button>
          <button type="button" onClick={() => setStep(3)}>
            Next
          </button>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>Step 3 of 3 — Review</h2>
          <p>Interests: {topics.join(", ")}</p>
          <p>Skill level: {skillLevel}</p>
          <button type="button" onClick={() => setStep(2)}>
            Back
          </button>
          <button type="submit">Save and continue</button>
        </section>
      )}
    </form>
  );
}
