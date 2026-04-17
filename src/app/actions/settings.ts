"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettings,
} from "@/lib/settings";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const shadowValues = ["none", "sm", "md", "lg"] as const;
const headerLayoutValues = ["side", "stacked"] as const;
const headerPlacementValues = ["split", "stacked", "centered"] as const;
const cardFontFamilyValues = [
  "montserrat",
  "ibm-plex-sans",
  "space-grotesk",
  "source-serif-4",
] as const;

const textOrBlank = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters`);

const hexOrBlank = z
  .string()
  .trim()
  .refine((value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value), "Use #RRGGBB format");

const logoUrlOrBlank = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value) || /^\/(?!\/)/.test(value),
    "Use a full https:// URL or a root-relative /path",
  );

const numberOrBlank = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : Number(text);
    },
    z
      .number()
      .int()
      .min(min, `Use a value between ${min} and ${max}`)
      .max(max, `Use a value between ${min} and ${max}`)
      .optional(),
  );

const shadowOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : text;
  },
  z.enum(shadowValues).optional(),
);

const headerLayoutOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : text;
  },
  z.enum(headerLayoutValues).optional(),
);

const headerPlacementOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : text;
  },
  z.enum(headerPlacementValues).optional(),
);

const cardFontFamilyOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : text;
  },
  z.enum(cardFontFamilyValues).optional(),
);

const settingsSchema = z.object({
  logoUrl: logoUrlOrBlank,
  logoAlt: textOrBlank(160),
  logoSizePx: numberOrBlank(40, 400),
  headerLayout: headerLayoutOrBlank,
  headerPlacement: headerPlacementOrBlank,
  brandLine1: textOrBlank(40),
  brandLine2: textOrBlank(40),
  headerTitle: textOrBlank(120),
  headerSubtitle: textOrBlank(200),
  headerTitleSizePx: numberOrBlank(18, 48),
  headerTextPaddingTopPx: numberOrBlank(0, 48),
  headerTextPaddingBottomPx: numberOrBlank(0, 48),
  headerTitleSubtitleGapPx: numberOrBlank(0, 32),
  heroTitle: textOrBlank(120),
  heroLede: textOrBlank(2000),
  emptyStateText: textOrBlank(2000),
  manageAddTitle: textOrBlank(120),
  manageAddBlurb: textOrBlank(2000),
  manageOrderTitle: textOrBlank(120),
  manageOrderBlurb: textOrBlank(2000),
  manageEmptyDragText: textOrBlank(2000),
  loginTitle: textOrBlank(120),
  loginLede: textOrBlank(2000),
  loginBackLabel: textOrBlank(120),
  colorPrimary: hexOrBlank,
  colorPrimaryDark: hexOrBlank,
  colorText: hexOrBlank,
  colorTextMuted: hexOrBlank,
  colorBorder: hexOrBlank,
  colorPageBg: hexOrBlank,
  colorCardBg: hexOrBlank,
  colorCardBorder: hexOrBlank,
  colorCardAccent: hexOrBlank,
  colorCardTitle: hexOrBlank,
  colorCardDescription: hexOrBlank,
  colorUrlOnCard: hexOrBlank,
  cardFontFamily: cardFontFamilyOrBlank,
  cardTitleSizePx: numberOrBlank(14, 32),
  cardUrlSizePx: numberOrBlank(10, 24),
  cardDescriptionSizePx: numberOrBlank(12, 28),
  cardPaddingPx: numberOrBlank(12, 36),
  cardAccentHeightPx: numberOrBlank(2, 16),
  cardRadiusPx: numberOrBlank(4, 32),
  cardShadow: shadowOrBlank,
});

type NormalizedSettings = ReturnType<typeof buildNormalizedSettings>;

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function readMergedValue(formData: FormData, key: string, fallback: unknown): string {
  if (formData.has(key)) {
    return readString(formData, key);
  }
  if (fallback == null) return "";
  return String(fallback);
}

function cleanTextOrEmpty(value: string): string {
  return value.trim();
}

function fallbackText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildNormalizedSettings(v: z.infer<typeof settingsSchema>) {
  return {
    logoUrl: v.logoUrl || null,
    logoAlt: v.logoUrl ? cleanTextOrEmpty(v.logoAlt) : null,
    logoSizePx: v.logoSizePx ?? DEFAULT_SITE_SETTINGS.logoSizePx,
    headerLayout: v.headerLayout ?? DEFAULT_SITE_SETTINGS.headerLayout,
    headerPlacement: v.headerPlacement ?? DEFAULT_SITE_SETTINGS.headerPlacement,
    brandLine1: cleanTextOrEmpty(v.brandLine1),
    brandLine2: cleanTextOrEmpty(v.brandLine2),
    headerTitle: cleanTextOrEmpty(v.headerTitle),
    headerSubtitle: cleanTextOrEmpty(v.headerSubtitle),
    headerTitleSizePx: v.headerTitleSizePx ?? DEFAULT_SITE_SETTINGS.headerTitleSizePx,
    headerTextPaddingTopPx:
      v.headerTextPaddingTopPx ?? DEFAULT_SITE_SETTINGS.headerTextPaddingTopPx,
    headerTextPaddingBottomPx:
      v.headerTextPaddingBottomPx ?? DEFAULT_SITE_SETTINGS.headerTextPaddingBottomPx,
    headerTitleSubtitleGapPx:
      v.headerTitleSubtitleGapPx ?? DEFAULT_SITE_SETTINGS.headerTitleSubtitleGapPx,
    heroTitle: cleanTextOrEmpty(v.heroTitle),
    heroLede: cleanTextOrEmpty(v.heroLede),
    emptyStateText: cleanTextOrEmpty(v.emptyStateText),
    manageAddTitle: cleanTextOrEmpty(v.manageAddTitle),
    manageAddBlurb: cleanTextOrEmpty(v.manageAddBlurb),
    manageOrderTitle: cleanTextOrEmpty(v.manageOrderTitle),
    manageOrderBlurb: cleanTextOrEmpty(v.manageOrderBlurb),
    manageEmptyDragText: cleanTextOrEmpty(v.manageEmptyDragText),
    loginTitle: cleanTextOrEmpty(v.loginTitle),
    loginLede: cleanTextOrEmpty(v.loginLede),
    loginBackLabel: cleanTextOrEmpty(v.loginBackLabel),
    colorPrimary: fallbackText(v.colorPrimary, DEFAULT_SITE_SETTINGS.colorPrimary),
    colorPrimaryDark: fallbackText(v.colorPrimaryDark, DEFAULT_SITE_SETTINGS.colorPrimaryDark),
    colorText: fallbackText(v.colorText, DEFAULT_SITE_SETTINGS.colorText),
    colorTextMuted: fallbackText(v.colorTextMuted, DEFAULT_SITE_SETTINGS.colorTextMuted),
    colorBorder: fallbackText(v.colorBorder, DEFAULT_SITE_SETTINGS.colorBorder),
    colorPageBg: fallbackText(v.colorPageBg, DEFAULT_SITE_SETTINGS.colorPageBg),
    colorCardBg: fallbackText(v.colorCardBg, DEFAULT_SITE_SETTINGS.colorCardBg),
    colorCardBorder: fallbackText(v.colorCardBorder, DEFAULT_SITE_SETTINGS.colorCardBorder),
    colorCardAccent: fallbackText(v.colorCardAccent, DEFAULT_SITE_SETTINGS.colorCardAccent),
    colorCardTitle: fallbackText(v.colorCardTitle, DEFAULT_SITE_SETTINGS.colorCardTitle),
    colorCardDescription: fallbackText(
      v.colorCardDescription,
      DEFAULT_SITE_SETTINGS.colorCardDescription,
    ),
    colorUrlOnCard: fallbackText(v.colorUrlOnCard, DEFAULT_SITE_SETTINGS.colorUrlOnCard),
    cardFontFamily: v.cardFontFamily ?? DEFAULT_SITE_SETTINGS.cardFontFamily,
    cardTitleSizePx: v.cardTitleSizePx ?? DEFAULT_SITE_SETTINGS.cardTitleSizePx,
    cardUrlSizePx: v.cardUrlSizePx ?? DEFAULT_SITE_SETTINGS.cardUrlSizePx,
    cardDescriptionSizePx:
      v.cardDescriptionSizePx ?? DEFAULT_SITE_SETTINGS.cardDescriptionSizePx,
    cardPaddingPx: v.cardPaddingPx ?? DEFAULT_SITE_SETTINGS.cardPaddingPx,
    cardAccentHeightPx: v.cardAccentHeightPx ?? DEFAULT_SITE_SETTINGS.cardAccentHeightPx,
    cardRadiusPx: v.cardRadiusPx ?? DEFAULT_SITE_SETTINGS.cardRadiusPx,
    cardShadow: v.cardShadow ?? DEFAULT_SITE_SETTINGS.cardShadow,
    updatedAt: new Date(),
  };
}

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    throw new Error("Unauthorized");
  }
}

type Capabilities = {
  supportsLogoStorage: boolean;
  supportsHeaderTitleSize: boolean;
  supportsNewLogoHeaderFields: boolean;
  supportsHeaderPlacement: boolean;
  supportsHeaderSpacing: boolean;
  supportsAdvancedCardStyling: boolean;
};

async function saveSettings(settings: NormalizedSettings, caps: Capabilities) {
  const db = getDb();
  const columns = [sql.identifier("id")];
  const values: SQL[] = [sql`${1}`];
  const updates: SQL[] = [];

  const add = (column: string, value: unknown) => {
    columns.push(sql.identifier(column));
    values.push(sql`${value}`);
    updates.push(sql`${sql.identifier(column)} = excluded.${sql.identifier(column)}`);
  };

  if (caps.supportsLogoStorage) {
    add("logo_url", settings.logoUrl);
    add("logo_alt", settings.logoAlt);
  }
  if (caps.supportsNewLogoHeaderFields) {
    add("logo_size_px", settings.logoSizePx);
    add("header_layout", settings.headerLayout);
  }
  if (caps.supportsHeaderPlacement) {
    add("header_placement", settings.headerPlacement);
  }
  if (caps.supportsHeaderTitleSize) {
    add("header_title_size_px", settings.headerTitleSizePx);
  }
  if (caps.supportsHeaderSpacing) {
    add("header_text_padding_top_px", settings.headerTextPaddingTopPx);
    add("header_text_padding_bottom_px", settings.headerTextPaddingBottomPx);
    add("header_title_subtitle_gap_px", settings.headerTitleSubtitleGapPx);
  }

  add("brand_line1", settings.brandLine1);
  add("brand_line2", settings.brandLine2);
  add("header_title", settings.headerTitle);
  add("header_subtitle", settings.headerSubtitle);
  add("hero_title", settings.heroTitle);
  add("hero_lede", settings.heroLede);
  add("empty_state_text", settings.emptyStateText);
  add("manage_add_title", settings.manageAddTitle);
  add("manage_add_blurb", settings.manageAddBlurb);
  add("manage_order_title", settings.manageOrderTitle);
  add("manage_order_blurb", settings.manageOrderBlurb);
  add("manage_empty_drag_text", settings.manageEmptyDragText);
  add("login_title", settings.loginTitle);
  add("login_lede", settings.loginLede);
  add("login_back_label", settings.loginBackLabel);
  add("color_primary", settings.colorPrimary);
  add("color_primary_dark", settings.colorPrimaryDark);
  add("color_text", settings.colorText);
  add("color_text_muted", settings.colorTextMuted);
  add("color_border", settings.colorBorder);
  add("color_page_bg", settings.colorPageBg);
  add("color_card_bg", settings.colorCardBg);
  if (caps.supportsAdvancedCardStyling) {
    add("color_card_border", settings.colorCardBorder);
  }
  add("color_card_accent", settings.colorCardAccent);
  if (caps.supportsAdvancedCardStyling) {
    add("color_card_title", settings.colorCardTitle);
    add("color_card_description", settings.colorCardDescription);
  }
  add("color_url_on_card", settings.colorUrlOnCard);
  if (caps.supportsAdvancedCardStyling) {
    add("card_font_family", settings.cardFontFamily);
    add("card_title_size_px", settings.cardTitleSizePx);
    add("card_url_size_px", settings.cardUrlSizePx);
    add("card_description_size_px", settings.cardDescriptionSizePx);
    add("card_padding_px", settings.cardPaddingPx);
    add("card_accent_height_px", settings.cardAccentHeightPx);
  }
  add("card_radius_px", settings.cardRadiusPx);
  add("card_shadow", settings.cardShadow);
  add("updated_at", settings.updatedAt);

  await db.execute(sql`
    insert into "site_settings" (${sql.join(columns, sql`, `)})
    values (${sql.join(values, sql`, `)})
    on conflict ("id") do update set ${sql.join(updates, sql`, `)}
  `);
}

type ColumnRow = Record<string, unknown> & {
  column_name: string;
};

export async function updateSiteSettingsAction(formData: FormData) {
  await requireSession();
  const currentSettings = await getSiteSettings();

  const raw = {
    logoUrl: readMergedValue(formData, "logoUrl", currentSettings.logoUrl),
    logoAlt: readMergedValue(formData, "logoAlt", currentSettings.logoAlt),
    logoSizePx: readMergedValue(formData, "logoSizePx", currentSettings.logoSizePx),
    headerLayout: readMergedValue(formData, "headerLayout", currentSettings.headerLayout),
    headerPlacement: readMergedValue(
      formData,
      "headerPlacement",
      currentSettings.headerPlacement,
    ),
    brandLine1: readMergedValue(formData, "brandLine1", currentSettings.brandLine1),
    brandLine2: readMergedValue(formData, "brandLine2", currentSettings.brandLine2),
    headerTitle: readMergedValue(formData, "headerTitle", currentSettings.headerTitle),
    headerSubtitle: readMergedValue(
      formData,
      "headerSubtitle",
      currentSettings.headerSubtitle,
    ),
    headerTitleSizePx: readMergedValue(
      formData,
      "headerTitleSizePx",
      currentSettings.headerTitleSizePx,
    ),
    headerTextPaddingTopPx: readMergedValue(
      formData,
      "headerTextPaddingTopPx",
      currentSettings.headerTextPaddingTopPx,
    ),
    headerTextPaddingBottomPx: readMergedValue(
      formData,
      "headerTextPaddingBottomPx",
      currentSettings.headerTextPaddingBottomPx,
    ),
    headerTitleSubtitleGapPx: readMergedValue(
      formData,
      "headerTitleSubtitleGapPx",
      currentSettings.headerTitleSubtitleGapPx,
    ),
    heroTitle: readMergedValue(formData, "heroTitle", currentSettings.heroTitle),
    heroLede: readMergedValue(formData, "heroLede", currentSettings.heroLede),
    emptyStateText: readMergedValue(
      formData,
      "emptyStateText",
      currentSettings.emptyStateText,
    ),
    manageAddTitle: readMergedValue(
      formData,
      "manageAddTitle",
      currentSettings.manageAddTitle,
    ),
    manageAddBlurb: readMergedValue(
      formData,
      "manageAddBlurb",
      currentSettings.manageAddBlurb,
    ),
    manageOrderTitle: readMergedValue(
      formData,
      "manageOrderTitle",
      currentSettings.manageOrderTitle,
    ),
    manageOrderBlurb: readMergedValue(
      formData,
      "manageOrderBlurb",
      currentSettings.manageOrderBlurb,
    ),
    manageEmptyDragText: readMergedValue(
      formData,
      "manageEmptyDragText",
      currentSettings.manageEmptyDragText,
    ),
    loginTitle: readMergedValue(formData, "loginTitle", currentSettings.loginTitle),
    loginLede: readMergedValue(formData, "loginLede", currentSettings.loginLede),
    loginBackLabel: readMergedValue(
      formData,
      "loginBackLabel",
      currentSettings.loginBackLabel,
    ),
    colorPrimary: readMergedValue(formData, "colorPrimary", currentSettings.colorPrimary),
    colorPrimaryDark: readMergedValue(
      formData,
      "colorPrimaryDark",
      currentSettings.colorPrimaryDark,
    ),
    colorText: readMergedValue(formData, "colorText", currentSettings.colorText),
    colorTextMuted: readMergedValue(
      formData,
      "colorTextMuted",
      currentSettings.colorTextMuted,
    ),
    colorBorder: readMergedValue(formData, "colorBorder", currentSettings.colorBorder),
    colorPageBg: readMergedValue(formData, "colorPageBg", currentSettings.colorPageBg),
    colorCardBg: readMergedValue(formData, "colorCardBg", currentSettings.colorCardBg),
    colorCardBorder: readMergedValue(
      formData,
      "colorCardBorder",
      currentSettings.colorCardBorder,
    ),
    colorCardAccent: readMergedValue(
      formData,
      "colorCardAccent",
      currentSettings.colorCardAccent,
    ),
    colorCardTitle: readMergedValue(
      formData,
      "colorCardTitle",
      currentSettings.colorCardTitle,
    ),
    colorCardDescription: readMergedValue(
      formData,
      "colorCardDescription",
      currentSettings.colorCardDescription,
    ),
    colorUrlOnCard: readMergedValue(
      formData,
      "colorUrlOnCard",
      currentSettings.colorUrlOnCard,
    ),
    cardFontFamily: readMergedValue(
      formData,
      "cardFontFamily",
      currentSettings.cardFontFamily,
    ),
    cardTitleSizePx: readMergedValue(
      formData,
      "cardTitleSizePx",
      currentSettings.cardTitleSizePx,
    ),
    cardUrlSizePx: readMergedValue(formData, "cardUrlSizePx", currentSettings.cardUrlSizePx),
    cardDescriptionSizePx: readMergedValue(
      formData,
      "cardDescriptionSizePx",
      currentSettings.cardDescriptionSizePx,
    ),
    cardPaddingPx: readMergedValue(formData, "cardPaddingPx", currentSettings.cardPaddingPx),
    cardAccentHeightPx: readMergedValue(
      formData,
      "cardAccentHeightPx",
      currentSettings.cardAccentHeightPx,
    ),
    cardRadiusPx: readMergedValue(formData, "cardRadiusPx", currentSettings.cardRadiusPx),
    cardShadow: readMergedValue(formData, "cardShadow", currentSettings.cardShadow),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, saved: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const normalized = buildNormalizedSettings(parsed.data);

  try {
    const capsResult = await getDb().execute<ColumnRow>(sql`
      select column_name
      from information_schema.columns
      where table_name = 'site_settings'
    `);
    const existingColumns = new Set(capsResult.rows.map((r) => String(r.column_name)));
    
    const caps: Capabilities = {
      supportsLogoStorage: existingColumns.has("logo_url") && existingColumns.has("logo_alt"),
      supportsHeaderTitleSize: existingColumns.has("header_title_size_px"),
      supportsNewLogoHeaderFields: existingColumns.has("logo_size_px") && existingColumns.has("header_layout"),
      supportsHeaderPlacement: existingColumns.has("header_placement"),
      supportsHeaderSpacing:
        existingColumns.has("header_text_padding_top_px") &&
        existingColumns.has("header_text_padding_bottom_px") &&
        existingColumns.has("header_title_subtitle_gap_px"),
      supportsAdvancedCardStyling:
        existingColumns.has("color_card_border") &&
        existingColumns.has("color_card_title") &&
        existingColumns.has("color_card_description") &&
        existingColumns.has("card_font_family") &&
        existingColumns.has("card_title_size_px") &&
        existingColumns.has("card_url_size_px") &&
        existingColumns.has("card_description_size_px") &&
        existingColumns.has("card_padding_px") &&
        existingColumns.has("card_accent_height_px"),
    };

    await saveSettings(normalized, caps);

    const fieldErrors: Record<string, string[]> = {};
    if (!caps.supportsLogoStorage && normalized.logoUrl) {
      fieldErrors.logoUrl = ["Logo storage is not available in the database yet. Other settings were saved."];
    }
    if (
      !caps.supportsNewLogoHeaderFields &&
      (
        normalized.logoSizePx !== DEFAULT_SITE_SETTINGS.logoSizePx ||
        normalized.headerLayout !== DEFAULT_SITE_SETTINGS.headerLayout
      )
    ) {
      fieldErrors.logoSizePx = ["Logo sizing and header layout are not available in the database yet. Other settings were saved."];
    }
    if (!caps.supportsHeaderTitleSize && readString(formData, "headerTitleSizePx").trim() !== "") {
      fieldErrors.headerTitleSizePx = ["Custom title sizing is not available in the database yet. Other settings were saved."];
    }
    if (!caps.supportsHeaderPlacement && normalized.headerPlacement !== DEFAULT_SITE_SETTINGS.headerPlacement) {
      fieldErrors.headerPlacement = ["Header placement is not available in the database yet. Other settings were saved."];
    }
    if (
      !caps.supportsHeaderSpacing &&
      (
        normalized.headerTextPaddingTopPx !== DEFAULT_SITE_SETTINGS.headerTextPaddingTopPx ||
        normalized.headerTextPaddingBottomPx !== DEFAULT_SITE_SETTINGS.headerTextPaddingBottomPx ||
        normalized.headerTitleSubtitleGapPx !== DEFAULT_SITE_SETTINGS.headerTitleSubtitleGapPx
      )
    ) {
      fieldErrors.headerTextPaddingTopPx = [
        "Header text spacing is not available in the database yet. Other settings were saved.",
      ];
    }
    if (
      !caps.supportsAdvancedCardStyling &&
      (
        normalized.colorCardBorder !== DEFAULT_SITE_SETTINGS.colorCardBorder ||
        normalized.colorCardTitle !== DEFAULT_SITE_SETTINGS.colorCardTitle ||
        normalized.colorCardDescription !== DEFAULT_SITE_SETTINGS.colorCardDescription ||
        normalized.cardFontFamily !== DEFAULT_SITE_SETTINGS.cardFontFamily ||
        normalized.cardTitleSizePx !== DEFAULT_SITE_SETTINGS.cardTitleSizePx ||
        normalized.cardUrlSizePx !== DEFAULT_SITE_SETTINGS.cardUrlSizePx ||
        normalized.cardDescriptionSizePx !== DEFAULT_SITE_SETTINGS.cardDescriptionSizePx ||
        normalized.cardPaddingPx !== DEFAULT_SITE_SETTINGS.cardPaddingPx ||
        normalized.cardAccentHeightPx !== DEFAULT_SITE_SETTINGS.cardAccentHeightPx
      )
    ) {
      fieldErrors.cardFontFamily = [
        "Advanced card styling is not available in the database yet. Other settings were saved.",
      ];
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false as const, saved: true as const, error: fieldErrors };
    }
  } catch (error) {
    return {
      ok: false as const,
      saved: false as const,
      error: {
        formErrors: [error instanceof Error ? error.message : "Could not save settings."],
      },
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/login");
  return { ok: true as const, saved: true as const };
}
