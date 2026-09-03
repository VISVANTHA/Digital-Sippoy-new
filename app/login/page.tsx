"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAsyncSubmit } from "../use-async-submit";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { submitting, error, handleSubmit } = useAsyncSubmit(async () => {
    const result = await signIn("credentials", { username, password, redirect: false });
    if (result?.error) {
      throw new Error("Invalid username or password");
    }
    router.push("/");
    router.refresh();
  });

  return (
    <main className="page">
      <h1>Sign in</h1>
      <p className="subtitle">Digital-Sippoy demo credentials required to view or edit items.</p>

      <form onSubmit={handleSubmit} className="items-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error && <p className="items-form-error">{error}</p>}
    </main>
  );
}
