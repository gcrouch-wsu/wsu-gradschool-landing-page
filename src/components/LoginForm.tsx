"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

type LoginState = { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {} as LoginState);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-[var(--wsu-gray)]">Admin sign in</h1>
      <p className="mb-6 text-sm text-[var(--wsu-gray-mid)]">
        Enter the shared admin password to manage application cards. The public directory stays at the home
        page.
      </p>
      <form action={formAction} className="space-y-4 rounded-[10px] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
          />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[var(--wsu-crimson)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
