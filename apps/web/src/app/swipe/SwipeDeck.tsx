"use client";

import { useRef, useState } from "react";
import { submitFeedback } from "@/app/matches/actions";
import { Button, Badge, Card } from "@/components/ui";

export interface SwipeCard {
  repoId: string;
  fullName: string;
  description: string;
  languages: string[];
  stars: number;
  reason: string;
}

interface Props {
  cards: SwipeCard[];
}

const SWIPE_THRESHOLD = 100;

export function SwipeDeck({ cards }: Props) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  const current = cards[index];

  function commit(signal: "swipe_r" | "swipe_l") {
    if (!current) return;
    void submitFeedback(current.repoId, signal);
    setIndex((i) => i + 1);
    setDragX(0);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  }

  function onPointerUp() {
    dragging.current = false;
    if (dragX > SWIPE_THRESHOLD) commit("swipe_r");
    else if (dragX < -SWIPE_THRESHOLD) commit("swipe_l");
    else setDragX(0);
  }

  if (!current) {
    return (
      <Card>
        <Card.Body>
          <p style={{ color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
            No more matches to swipe — check{" "}
            <a href="/matches">your matches list</a> for the full list, or come back after the
            next cycle.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const rotation = dragX / 20;
  // Visual cue: card tints green when dragging right, red when dragging left
  const tintOpacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) * 0.15;
  const tintColor =
    dragX > 0
      ? `rgba(0, 255, 163, ${tintOpacity})`
      : `rgba(248, 81, 73, ${tintOpacity})`;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Swipeable card */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          touchAction: "pan-y",
          cursor: "grab",
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          transition: dragging.current ? "none" : "transform 0.2s ease",
          userSelect: "none",
        }}
      >
        <Card>
          <Card.Header>
            <h3 className="rm-card__title" style={{ background: tintColor, borderRadius: 4, padding: tintColor !== "rgba(0, 255, 163, 0)" ? "2px 6px" : 0 }}>
              {current.fullName}
            </h3>
          </Card.Header>
          <Card.Body>
            <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>
              {current.description || "No description available."}
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: 12, fontSize: "0.875rem" }}>
              {current.reason}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {current.languages.map((l) => (
                <Badge key={l} variant="secondary" size="sm">{l}</Badge>
              ))}
              <Badge variant="secondary" size="sm">★ {current.stars.toLocaleString()}</Badge>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => commit("swipe_l")}
              aria-label="Pass on this repository"
            >
              👎 Pass
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => commit("swipe_r")}
              aria-label="Save this repository"
            >
              👍 Save
            </Button>
          </Card.Footer>
        </Card>
      </div>

      {/* Progress */}
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 16, fontSize: "0.875rem" }}>
        {index + 1} of {cards.length}
      </p>
    </div>
  );
}
