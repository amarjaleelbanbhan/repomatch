"use client";

import { useFormState, useFormStatus } from "react-dom";
import { claimRepo, type ClaimResult } from "./actions";

const initialState: ClaimResult = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Verifying…" : "Claim repo"}
    </button>
  );
}

export function ClaimForm() {
  const [state, formAction] = useFormState(claimRepo, initialState);

  return (
    <form action={formAction}>
      <label>
        Repo (owner/name)
        <input type="text" name="fullName" placeholder="octocat/hello-world" required />
      </label>
      <label>
        Pitch
        <input type="text" name="pitch" placeholder="One line on why people should contribute" />
      </label>
      <label>
        Help wanted areas (comma-separated)
        <input type="text" name="helpWanted" placeholder="docs, good-first-issues, tests" />
      </label>
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p>Claimed! It'll show as a welcoming repo starting next cycle.</p>}
    </form>
  );
}
