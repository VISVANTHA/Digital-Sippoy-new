"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAsyncSubmit } from "./use-async-submit";

export default function ItemsForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const { submitting, error, handleSubmit } = useAsyncSubmit(async () => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create item");
    }
    setName("");
    router.refresh();
  });

  return (
    <form onSubmit={handleSubmit} className="items-form">
      <input
        type="text"
        name="name"
        placeholder="New item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add item"}
      </button>
      {error && <p className="items-form-error">{error}</p>}
    </form>
  );
}
