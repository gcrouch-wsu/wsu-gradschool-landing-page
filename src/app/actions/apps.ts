"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { APP_CARD_DESCRIPTION_MAX } from "@/lib/app-card-limits";
import {
  deleteApp,
  getMaxSortOrder,
  insertApp,
  updateApp,
  updateSortOrders,
} from "@/lib/apps";

const urlField = z
  .string()
  .trim()
  .min(1, "URL is required")
  .transform((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`))
  .pipe(z.string().url("Enter a valid URL"));

const actionLabelField = z
  .string()
  .trim()
  .max(80, "Keep the link label under 80 characters")
  .transform((s) => (s === "" ? "Open tool" : s));

const appInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  actionLabel: actionLabelField,
  url: urlField,
  description: z
    .string()
    .trim()
    .max(APP_CARD_DESCRIPTION_MAX, `Keep the description under ${APP_CARD_DESCRIPTION_MAX} characters`)
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
    actionLabel: formData.get("actionLabel"),
    url: formData.get("url"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const nextOrder = (await getMaxSortOrder()) + 1;
  await insertApp({
    title: parsed.data.title,
    actionLabel: parsed.data.actionLabel,
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

export async function updateAppAction(formData: FormData) {
  await requireSession();
  const parsed = z
    .object({
      id: z.string().uuid("Invalid id"),
    })
    .and(appInput)
    .safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      actionLabel: formData.get("actionLabel"),
      url: formData.get("url"),
      description: formData.get("description") ?? undefined,
    });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const app = await updateApp({
    id: parsed.data.id,
    title: parsed.data.title,
    actionLabel: parsed.data.actionLabel,
    url: parsed.data.url,
    description: parsed.data.description ?? null,
  });

  revalidatePath("/");
  revalidatePath("/manage");
  return { ok: true as const, app };
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
