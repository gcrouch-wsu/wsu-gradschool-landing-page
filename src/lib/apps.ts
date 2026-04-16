import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { appCards, type AppCard } from "./schema";

export async function listAppsOrdered(): Promise<AppCard[]> {
  const db = getDb();
  return db.select().from(appCards).orderBy(asc(appCards.sortOrder), asc(appCards.createdAt));
}

export async function getMaxSortOrder(): Promise<number> {
  const db = getDb();
  const rows = await db.select({ sortOrder: appCards.sortOrder }).from(appCards);
  if (rows.length === 0) return -1;
  return Math.max(...rows.map((r) => r.sortOrder));
}

export async function insertApp(input: {
  title: string;
  url: string;
  description: string | null;
  sortOrder: number;
}) {
  const db = getDb();
  const [row] = await db
    .insert(appCards)
    .values({
      title: input.title,
      url: input.url,
      description: input.description,
      sortOrder: input.sortOrder,
    })
    .returning();
  return row;
}

export async function deleteApp(id: string) {
  const db = getDb();
  await db.delete(appCards).where(eq(appCards.id, id));
}

export async function updateSortOrders(pairs: { id: string; sortOrder: number }[]) {
  const db = getDb();
  for (const { id, sortOrder } of pairs) {
    await db.update(appCards).set({ sortOrder }).where(eq(appCards.id, id));
  }
}
