"use client";

import { useState, type FormEvent } from "react";

/**
 * Shared submit-state handling for items-form.tsx and login/page.tsx --
 * both forms had an identical submitting/error state + try/finally block
 * (jscpd flagged the duplication once the login form was added); this is
 * the single extracted source, same pattern as lib/validate.ts.
 */
export function useAsyncSubmit(action: () => Promise<void>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, error, handleSubmit };
}
