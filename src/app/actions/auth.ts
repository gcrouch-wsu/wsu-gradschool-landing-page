"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Sets session cookie and returns success — no `redirect()` here so this can be called from
 * client `useActionState` / `fetch` without triggering the known Next.js "Application error"
 * when redirect throws inside a server action used with those patterns.
 */
export async function loginWithPassword(formData: FormData): Promise<LoginResult> {
  const password = String(formData.get("password") ?? "").trim();
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || password !== expected) {
    return { ok: false, error: "Incorrect password. Try again." };
  }
  let token: string;
  try {
    token = await createSessionToken();
  } catch {
    return {
      ok: false,
      error: "Server configuration error (check SESSION_SECRET is set and at least 32 characters).",
    };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}
