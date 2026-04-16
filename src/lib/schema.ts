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
  brandLine1: text("brand_line1").notNull().default("WSU"),
  brandLine2: text("brand_line2").notNull().default("Grad"),
  headerTitle: text("header_title").notNull().default("Graduate School Tools"),
  headerSubtitle: text("header_subtitle").notNull().default("Internal directory"),
  heroTitle: text("hero_title").notNull().default("Applications"),
  heroLede: text("hero_lede")
    .notNull()
    .default(
      "This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.",
    ),
  emptyStateText: text("empty_state_text")
    .notNull()
    .default("No applications yet. Use Manage apps to add the first card."),
  manageAddTitle: text("manage_add_title").notNull().default("Add application"),
  manageAddBlurb: text("manage_add_blurb")
    .notNull()
    .default(
      "Add a title and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.",
    ),
  manageOrderTitle: text("manage_order_title").notNull().default("Card order"),
  manageOrderBlurb: text("manage_order_blurb")
    .notNull()
    .default("Drag by the handle. The order here matches the public landing page."),
  manageEmptyDragText: text("manage_empty_drag_text").notNull().default("No cards yet. Add one above."),
  loginTitle: text("login_title").notNull().default("Sign in to manage the directory"),
  loginLede: text("login_lede")
    .notNull()
    .default(
      "Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.",
    ),
  loginBackLabel: text("login_back_label").notNull().default("Back to directory"),
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
