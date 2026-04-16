import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const appCards = pgTable("app_card", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type AppCard = typeof appCards.$inferSelect;
export type NewAppCard = typeof appCards.$inferInsert;
