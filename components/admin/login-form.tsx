"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function AdminLoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
          const res = await signIn("credentials", {
            email,
            password,
            callbackUrl: next,
            redirect: true,
          });
          if (res?.error) setError("Invalid credentials");
        } catch (err: any) {
          setError(err?.message || "Failed to sign in");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="space-y-1">
        <label className="text-sm text-gray-200" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="text-sm text-red-200 whitespace-pre-wrap">{error}</div>}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

