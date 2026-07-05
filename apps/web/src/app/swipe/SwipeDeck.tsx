"use client";

import { useRef, useState } from "react";
import { submitFeedback } from "@/app/matches/actions";

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
    return <p>No more matches to swipe — check /matches for the full list, or come back after the next cycle.</p>;
  }

  const rotation = dragX / 20;

  return (
    <div>
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
        }}
      >
        <section>
          <h2>{current.fullName}</h2>
          <p>{current.description || "No description available."}</p>
          <p>
            {current.languages.join(", ")} · ★ {current.stars}
          </p>
          <p>{current.reason}</p>
        </section>
      </div>

      <div>
        <button type="button" onClick={() => commit("swipe_l")}>
          👎 Pass
        </button>
        <button type="button" onClick={() => commit("swipe_r")}>
          👍 Save
        </button>
      </div>

      <p>
        {index + 1} of {cards.length}
      </p>
    </div>
  );
}
