"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import {
  deleteApp,
  getMaxSortOrder,
  insertApp,
  listAppsOrdered,
  updateSortOrders,
} from "@/lib/apps";

const urlField = z
  .string()
  .trim()
  .min(1, "URL is required")
  .transform((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`))
  .pipe(z.string().url("Enter a valid URL"));

const appInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  url: urlField,
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
});

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    throw new Error("Unauthorized");
  }
}

export async function createAppAction(formData: FormData) {
  await requireSession();
  const parsed = appInput.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const nextOrder = (await getMaxSortOrder()) + 1;
  await insertApp({
    title: parsed.data.title,
    url: parsed.data.url,
    description: parsed.data.description ?? null,
    sortOrder: nextOrder,
  });
  revalidatePath("/");
  revalidatePath("/manage");
  return { ok: true as const };
}

export async function deleteAppAction(id: string) {
  await requireSession();
  const uuid = z.string().uuid().safeParse(id);
  if (!uuid.success) return { ok: false as const, error: "Invalid id" };
  await deleteApp(uuid.data);
  revalidatePath("/");
  revalidatePath("/manage");
  return { ok: true as const };
}

export async function reorderAppsAction(orderedIds: string[]) {
  await requireSession();
  const idSchema = z.string().uuid();
  const pairs: { id: string; sortOrder: number }[] = [];
  for (let i = 0; i < orderedIds.length; i++) {
    const r = idSchema.safeParse(orderedIds[i]);
    if (!r.success) return { ok: false as const, error: "Invalid id list" };
    pairs.push({ id: r.data, sortOrder: i });
  }
  await updateSortOrders(pairs);
  revalidatePath("/");
  revalidatePath("/manage");
  return { ok: true as const };
}
