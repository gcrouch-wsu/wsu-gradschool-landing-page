"use client";

import { useState } from "react";
import { loginWithPassword } from "@/app/actions/auth";
import { isSafeInternalPath } from "@/lib/safe-path";

type Props = {
  nextPath: string;
};

export function LoginForm({ nextPath }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginWithPassword(formData);
      if (result.ok) {
        const target = String(formData.get("next") ?? "/manage");
        window.location.assign(isSafeInternalPath(target) ? target : "/manage");
        return;
      }
      setError(result.error);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  const returnText =
    nextPath === "/manage"
      ? "After you sign in, you will land on the manage page."
      : `After you sign in, you will return to ${nextPath}.`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[18px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
    >
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--wsu-crimson)]">
          Admin access
        </p>
        <h2 className="mt-2 text-xl font-bold text-[var(--wsu-gray)]">Shared password</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--wsu-gray-mid)]">
          Enter the shared admin password for editors. Only this field is required.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
        >
          Password
        </label>
        <div className="flex gap-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            className="w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
            placeholder="Enter the shared admin password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="shrink-0 rounded-xl border border-[var(--wsu-gray-light)] px-3 text-sm font-semibold text-[var(--wsu-gray)] transition hover:bg-[var(--wsu-bg)]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--wsu-gray-mid)]">{returnText}</p>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--wsu-crimson)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
