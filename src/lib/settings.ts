import { sql } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import type { SiteSettingsRow } from "./schema";
import { DEFAULT_SITE_SETTINGS } from "./site-defaults";

export { DEFAULT_SITE_SETTINGS } from "./site-defaults";

type ColumnRow = Record<string, unknown> & {
  column_name: string;
};

type RawSettingsRow = Partial<SiteSettingsRow>;

export type SiteSettingsCapabilities = {
  supportsLogoStorage: boolean;
  supportsHeaderTitleSize: boolean;
};

function readNumber(value: unknown, fallback: number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : typeof fallback === "number" ? fallback : 0;
}

function normalizeSettingsRow(
  row: RawSettingsRow,
  capabilities: SiteSettingsCapabilities,
): SiteSettingsRow {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...row,
    logoUrl: capabilities.supportsLogoStorage ? row.logoUrl ?? null : null,
    logoAlt: capabilities.supportsLogoStorage ? row.logoAlt ?? null : null,
    logoSizePx: row.logoSizePx ? Number(row.logoSizePx) : DEFAULT_SITE_SETTINGS.logoSizePx,
    headerLayout: row.headerLayout ?? DEFAULT_SITE_SETTINGS.headerLayout,
    headerPlacement: row.headerPlacement ?? DEFAULT_SITE_SETTINGS.headerPlacement,
    headerTitleSizePx: capabilities.supportsHeaderTitleSize
      ? readNumber(row.headerTitleSizePx, DEFAULT_SITE_SETTINGS.headerTitleSizePx)
      : DEFAULT_SITE_SETTINGS.headerTitleSizePx,
    headerTextPaddingTopPx: readNumber(
      row.headerTextPaddingTopPx,
      DEFAULT_SITE_SETTINGS.headerTextPaddingTopPx,
    ),
    headerTextPaddingBottomPx: readNumber(
      row.headerTextPaddingBottomPx,
      DEFAULT_SITE_SETTINGS.headerTextPaddingBottomPx,
    ),
    headerTitleSubtitleGapPx: readNumber(
      row.headerTitleSubtitleGapPx,
      DEFAULT_SITE_SETTINGS.headerTitleSubtitleGapPx,
    ),
    colorCardBorder: row.colorCardBorder ?? DEFAULT_SITE_SETTINGS.colorCardBorder,
    colorCardTitle: row.colorCardTitle ?? DEFAULT_SITE_SETTINGS.colorCardTitle,
    colorCardDescription:
      row.colorCardDescription ?? DEFAULT_SITE_SETTINGS.colorCardDescription,
    cardFontFamily: row.cardFontFamily ?? DEFAULT_SITE_SETTINGS.cardFontFamily,
    cardTitleSizePx: readNumber(row.cardTitleSizePx, DEFAULT_SITE_SETTINGS.cardTitleSizePx),
    cardUrlSizePx: readNumber(row.cardUrlSizePx, DEFAULT_SITE_SETTINGS.cardUrlSizePx),
    cardDescriptionSizePx: readNumber(
      row.cardDescriptionSizePx,
      DEFAULT_SITE_SETTINGS.cardDescriptionSizePx,
    ),
    cardPaddingPx: readNumber(row.cardPaddingPx, DEFAULT_SITE_SETTINGS.cardPaddingPx),
    cardAccentHeightPx: readNumber(
      row.cardAccentHeightPx,
      DEFAULT_SITE_SETTINGS.cardAccentHeightPx,
    ),
    cardRadiusPx: readNumber(row.cardRadiusPx, DEFAULT_SITE_SETTINGS.cardRadiusPx),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt
        : row.updatedAt
          ? new Date(String(row.updatedAt))
          : null,
  };
}

export async function getSiteSettingsCapabilities(): Promise<SiteSettingsCapabilities> {
  try {
    const db = getDb();
    const result = await db.execute<ColumnRow>(sql`
      select column_name
      from information_schema.columns
      where table_name = 'site_settings'
        and column_name in ('logo_url', 'logo_alt', 'header_title_size_px')
    `);

    const names = new Set(result.rows.map((row) => String(row.column_name)));
    return {
      supportsLogoStorage: names.has("logo_url") && names.has("logo_alt"),
      supportsHeaderTitleSize: names.has("header_title_size_px"),
    };
  } catch {
    return {
      supportsLogoStorage: false,
      supportsHeaderTitleSize: false,
    };
  }
}

export async function siteSettingsSupportLogoColumns(): Promise<boolean> {
  return (await getSiteSettingsCapabilities()).supportsLogoStorage;
}

export async function siteSettingsSupportHeaderTitleSizeColumn(): Promise<boolean> {
  return (await getSiteSettingsCapabilities()).supportsHeaderTitleSize;
}

async function querySiteSettings(): Promise<SiteSettingsRow | null> {
  const db = getDb();
  
  try {
    const capsResult = await db.execute<ColumnRow>(sql`
      select column_name
      from information_schema.columns
      where table_name = 'site_settings'
    `);
    const cols = new Set(capsResult.rows.map((r) => String(r.column_name)));
    
    const selectFields: string[] = ["id"];
    const allExpected = [
      "logo_url", "logo_alt", "logo_size_px", "header_layout", "header_placement",
      "brand_line1", "brand_line2", "header_title", "header_subtitle",
      "header_title_size_px", "header_text_padding_top_px",
      "header_text_padding_bottom_px", "header_title_subtitle_gap_px", "hero_title",
      "hero_lede", "empty_state_text", "manage_add_title", "manage_add_blurb",
      "manage_order_title", "manage_order_blurb", "manage_empty_drag_text",
      "login_title", "login_lede", "login_back_label", "color_primary",
      "color_primary_dark", "color_text", "color_text_muted", "color_border",
      "color_page_bg", "color_card_bg", "color_card_border", "color_card_accent",
      "color_card_title", "color_card_description", "color_url_on_card",
      "card_font_family", "card_title_size_px", "card_url_size_px",
      "card_description_size_px", "card_padding_px", "card_accent_height_px",
      "card_radius_px", "card_shadow", "updated_at"
    ];

    for (const f of allExpected) {
      if (cols.has(f)) {
        const alias = f.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
        selectFields.push(`"${f}" as "${alias}"`);
      }
    }

    const query = sql.raw(`select ${selectFields.join(", ")} from "site_settings" where "id" = 1 limit 1`);
    const result = await db.execute<RawSettingsRow>(query);
    const row = result.rows[0];
    
    if (!row) return null;

    const finalCaps: SiteSettingsCapabilities = {
      supportsLogoStorage: cols.has("logo_url") && cols.has("logo_alt"),
      supportsHeaderTitleSize: cols.has("header_title_size_px"),
    };

    return normalizeSettingsRow(row, finalCaps);
  } catch (e) {
    console.error("Failed to query site settings dynamically:", e);
    return null;
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow> => {
  try {
    const settings = await querySiteSettings();
    if (settings) return settings;
  } catch {
    try {
      const settings = await querySiteSettings();
      if (settings) return settings;
    } catch {
      /* table missing or DB down */
    }
  }

  return DEFAULT_SITE_SETTINGS;
});
