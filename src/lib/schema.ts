import {
  integer,
  pgTable,
  smallint,
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

/** Single-row site copy + theme (id is always 1). */
export const siteSettings = pgTable("site_settings", {
  id: smallint("id").primaryKey().default(1),
  logoUrl: text("logo_url"),
  logoAlt: text("logo_alt"),
  logoSizePx: integer("logo_size_px").notNull().default(160),
  headerLayout: text("header_layout").notNull().default("side"), // 'side' or 'stacked'
  headerPlacement: text("header_placement").notNull().default("split"), // split, stacked, centered
  brandLine1: text("brand_line1"),
  brandLine2: text("brand_line2"),
  headerTitle: text("header_title"),
  headerSubtitle: text("header_subtitle"),
  headerTitleSizePx: integer("header_title_size_px"),
  heroTitle: text("hero_title"),
  heroLede: text("hero_lede"),
  emptyStateText: text("empty_state_text"),
  manageAddTitle: text("manage_add_title"),
  manageAddBlurb: text("manage_add_blurb"),
  manageOrderTitle: text("manage_order_title"),
  manageOrderBlurb: text("manage_order_blurb"),
  manageEmptyDragText: text("manage_empty_drag_text"),
  loginTitle: text("login_title"),
  loginLede: text("login_lede"),
  loginBackLabel: text("login_back_label"),
  colorPrimary: text("color_primary").notNull().default("#981e32"),
  colorPrimaryDark: text("color_primary_dark").notNull().default("#6d1524"),
  colorText: text("color_text").notNull().default("#393939"),
  colorTextMuted: text("color_text_muted").notNull().default("#5e6a71"),
  colorBorder: text("color_border").notNull().default("#e2e2e2"),
  colorPageBg: text("color_page_bg").notNull().default("#f7f5f5"),
  colorCardBg: text("color_card_bg").notNull().default("#ffffff"),
  colorCardAccent: text("color_card_accent").notNull().default("#981e32"),
  colorUrlOnCard: text("color_url_on_card").notNull().default("#981e32"),
  cardRadiusPx: integer("card_radius_px").notNull().default(10),
  cardShadow: text("card_shadow").notNull().default("md"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
