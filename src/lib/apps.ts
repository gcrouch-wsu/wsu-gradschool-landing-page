import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { appCards, type AppCard } from "./schema";

type ColumnRow = Record<string, unknown> & {
  column_name: string;
};

async function appCardsSupportActionLabel(): Promise<boolean> {
  const db = getDb();
  const result = await db.execute<ColumnRow>(sql`
    select column_name
    from information_schema.columns
    where table_name = 'app_card'
      and column_name = 'action_label'
  `);
  return result.rows.length > 0;
}

export async function listAppsOrdered(): Promise<AppCard[]> {
  const db = getDb();
  const supportsActionLabel = await appCardsSupportActionLabel();
  if (supportsActionLabel) {
    const rows = await db.select().from(appCards).orderBy(asc(appCards.sortOrder), asc(appCards.createdAt));
    return rows.map((row) => ({
      ...row,
      actionLabel: row.actionLabel?.trim() || "Open tool",
    }));
  }

  const rows = await db
    .select({
      id: appCards.id,
      title: appCards.title,
      url: appCards.url,
      description: appCards.description,
      sortOrder: appCards.sortOrder,
      createdAt: appCards.createdAt,
    })
    .from(appCards)
    .orderBy(asc(appCards.sortOrder), asc(appCards.createdAt));

  return rows.map((row) => ({
    ...row,
    actionLabel: "Open tool",
  }));
}

export async function getMaxSortOrder(): Promise<number> {
  const db = getDb();
  const rows = await db.select({ sortOrder: appCards.sortOrder }).from(appCards);
  if (rows.length === 0) return -1;
  return Math.max(...rows.map((r) => r.sortOrder));
}

export async function insertApp(input: {
  title: string;
  actionLabel: string;
  url: string;
  description: string | null;
  sortOrder: number;
}) {
  const db = getDb();
  const supportsActionLabel = await appCardsSupportActionLabel();
  const insertValues = {
    title: input.title,
    url: input.url,
    description: input.description,
    sortOrder: input.sortOrder,
    ...(supportsActionLabel ? { actionLabel: input.actionLabel } : {}),
  };

  if (supportsActionLabel) {
    const [row] = await db
      .insert(appCards)
      .values(insertValues)
      .returning({
        id: appCards.id,
        title: appCards.title,
        actionLabel: appCards.actionLabel,
        url: appCards.url,
        description: appCards.description,
        sortOrder: appCards.sortOrder,
        createdAt: appCards.createdAt,
      });
    return {
      ...row,
      actionLabel: row.actionLabel?.trim() || "Open tool",
    };
  }

  const [row] = await db
    .insert(appCards)
    .values(insertValues)
    .returning({
      id: appCards.id,
      title: appCards.title,
      url: appCards.url,
      description: appCards.description,
      sortOrder: appCards.sortOrder,
      createdAt: appCards.createdAt,
    });

  return {
    ...row,
    actionLabel: input.actionLabel || "Open tool",
  };
}

export async function updateApp(input: {
  id: string;
  title: string;
  actionLabel: string;
  url: string;
  description: string | null;
}): Promise<AppCard | null> {
  const db = getDb();
  const supportsActionLabel = await appCardsSupportActionLabel();
  const updateValues = {
    title: input.title,
    url: input.url,
    description: input.description,
    ...(supportsActionLabel ? { actionLabel: input.actionLabel } : {}),
  };

  if (supportsActionLabel) {
    const [row] = await db
      .update(appCards)
      .set(updateValues)
      .where(eq(appCards.id, input.id))
      .returning({
        id: appCards.id,
        title: appCards.title,
        actionLabel: appCards.actionLabel,
        url: appCards.url,
        description: appCards.description,
        sortOrder: appCards.sortOrder,
        createdAt: appCards.createdAt,
      });
    if (!row) return null;
    return {
      ...row,
      actionLabel: row.actionLabel?.trim() || "Open tool",
    };
  }

  const [row] = await db
    .update(appCards)
    .set(updateValues)
    .where(eq(appCards.id, input.id))
    .returning({
      id: appCards.id,
      title: appCards.title,
      url: appCards.url,
      description: appCards.description,
      sortOrder: appCards.sortOrder,
      createdAt: appCards.createdAt,
    });

  if (!row) return null;
  return {
    ...row,
    actionLabel: input.actionLabel || "Open tool",
  };
}

export async function deleteApp(id: string): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(appCards)
    .where(eq(appCards.id, id))
    .returning({ id: appCards.id });
  return deleted.length > 0;
}

export async function updateSortOrders(pairs: { id: string; sortOrder: number }[]) {
  const db = getDb();
  for (const { id, sortOrder } of pairs) {
    await db.update(appCards).set({ sortOrder }).where(eq(appCards.id, id));
  }
}
