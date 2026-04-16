import { sql } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import type { SiteSettingsRow } from "./schema";
import { DEFAULT_SITE_SETTINGS } from "./site-defaults";

export { DEFAULT_SITE_SETTINGS } from "./site-defaults";

type ColumnRow = {
  column_name: string;
};

type RawSettingsRow = Partial<SiteSettingsRow>;

function normalizeSettingsRow(row: RawSettingsRow, supportsLogoStorage: boolean): SiteSettingsRow {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...row,
    logoUrl: supportsLogoStorage ? row.logoUrl ?? null : null,
    logoAlt: supportsLogoStorage ? row.logoAlt ?? null : null,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt
        : row.updatedAt
          ? new Date(String(row.updatedAt))
          : null,
  };
}

export async function siteSettingsSupportLogoColumns(): Promise<boolean> {
  try {
    const db = getDb();
    const result = await db.execute(sql`
      select column_name
      from information_schema.columns
      where table_name = 'site_settings'
        and column_name in ('logo_url', 'logo_alt')
    `);

    const names = new Set((result.rows as ColumnRow[]).map((row) => String(row.column_name)));
    return names.has("logo_url") && names.has("logo_alt");
  } catch {
    return false;
  }
}

async function querySiteSettings(supportsLogoStorage: boolean): Promise<SiteSettingsRow | null> {
  const db = getDb();
  const result = supportsLogoStorage
    ? await db.execute<RawSettingsRow>(sql`
        select
          "id",
          "logo_url" as "logoUrl",
          "logo_alt" as "logoAlt",
          "brand_line1" as "brandLine1",
          "brand_line2" as "brandLine2",
          "header_title" as "headerTitle",
          "header_subtitle" as "headerSubtitle",
          "hero_title" as "heroTitle",
          "hero_lede" as "heroLede",
          "empty_state_text" as "emptyStateText",
          "manage_add_title" as "manageAddTitle",
          "manage_add_blurb" as "manageAddBlurb",
          "manage_order_title" as "manageOrderTitle",
          "manage_order_blurb" as "manageOrderBlurb",
          "manage_empty_drag_text" as "manageEmptyDragText",
          "login_title" as "loginTitle",
          "login_lede" as "loginLede",
          "login_back_label" as "loginBackLabel",
          "color_primary" as "colorPrimary",
          "color_primary_dark" as "colorPrimaryDark",
          "color_text" as "colorText",
          "color_text_muted" as "colorTextMuted",
          "color_border" as "colorBorder",
          "color_page_bg" as "colorPageBg",
          "color_card_bg" as "colorCardBg",
          "color_card_accent" as "colorCardAccent",
          "color_url_on_card" as "colorUrlOnCard",
          "card_radius_px" as "cardRadiusPx",
          "card_shadow" as "cardShadow",
          "updated_at" as "updatedAt"
        from "site_settings"
        where "id" = 1
        limit 1
      `)
    : await db.execute<RawSettingsRow>(sql`
        select
          "id",
          "brand_line1" as "brandLine1",
          "brand_line2" as "brandLine2",
          "header_title" as "headerTitle",
          "header_subtitle" as "headerSubtitle",
          "hero_title" as "heroTitle",
          "hero_lede" as "heroLede",
          "empty_state_text" as "emptyStateText",
          "manage_add_title" as "manageAddTitle",
          "manage_add_blurb" as "manageAddBlurb",
          "manage_order_title" as "manageOrderTitle",
          "manage_order_blurb" as "manageOrderBlurb",
          "manage_empty_drag_text" as "manageEmptyDragText",
          "login_title" as "loginTitle",
          "login_lede" as "loginLede",
          "login_back_label" as "loginBackLabel",
          "color_primary" as "colorPrimary",
          "color_primary_dark" as "colorPrimaryDark",
          "color_text" as "colorText",
          "color_text_muted" as "colorTextMuted",
          "color_border" as "colorBorder",
          "color_page_bg" as "colorPageBg",
          "color_card_bg" as "colorCardBg",
          "color_card_accent" as "colorCardAccent",
          "color_url_on_card" as "colorUrlOnCard",
          "card_radius_px" as "cardRadiusPx",
          "card_shadow" as "cardShadow",
          "updated_at" as "updatedAt"
        from "site_settings"
        where "id" = 1
        limit 1
      `);

  const row = result.rows[0];
  return row ? normalizeSettingsRow(row, supportsLogoStorage) : null;
}

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow> => {
  try {
    const supportsLogoStorage = await siteSettingsSupportLogoColumns();
    const settings = await querySiteSettings(supportsLogoStorage);
    if (settings) return settings;
  } catch {
    try {
      const settings = await querySiteSettings(false);
      if (settings) return settings;
    } catch {
      /* table missing or DB down */
    }
  }

  return DEFAULT_SITE_SETTINGS;
});
