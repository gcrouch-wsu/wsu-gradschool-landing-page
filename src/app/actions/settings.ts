"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  DEFAULT_SITE_SETTINGS,
} from "@/lib/settings";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const shadowValues = ["none", "sm", "md", "lg"] as const;
const headerLayoutValues = ["side", "stacked"] as const;

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

const settingsSchema = z.object({
  logoUrl: logoUrlOrBlank,
  logoAlt: textOrBlank(160),
  logoSizePx: numberOrBlank(40, 400),
  headerLayout: headerLayoutOrBlank,
  brandLine1: textOrBlank(40),
  brandLine2: textOrBlank(40),
  headerTitle: textOrBlank(120),
  headerSubtitle: textOrBlank(200),
  headerTitleSizePx: numberOrBlank(18, 48),
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
  colorCardAccent: hexOrBlank,
  colorUrlOnCard: hexOrBlank,
  cardRadiusPx: numberOrBlank(4, 32),
  cardShadow: shadowOrBlank,
});

type NormalizedSettings = ReturnType<typeof buildNormalizedSettings>;

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function cleanTextOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function fallbackText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildNormalizedSettings(v: z.infer<typeof settingsSchema>) {
  return {
    logoUrl: v.logoUrl || null,
    logoAlt: v.logoUrl ? cleanTextOrNull(v.logoAlt) : null,
    logoSizePx: v.logoSizePx ?? DEFAULT_SITE_SETTINGS.logoSizePx,
    headerLayout: v.headerLayout ?? DEFAULT_SITE_SETTINGS.headerLayout,
    brandLine1: cleanTextOrNull(v.brandLine1),
    brandLine2: cleanTextOrNull(v.brandLine2),
    headerTitle: cleanTextOrNull(v.headerTitle),
    headerSubtitle: cleanTextOrNull(v.headerSubtitle),
    headerTitleSizePx: v.headerTitleSizePx ?? DEFAULT_SITE_SETTINGS.headerTitleSizePx,
    heroTitle: cleanTextOrNull(v.heroTitle),
    heroLede: cleanTextOrNull(v.heroLede),
    emptyStateText: cleanTextOrNull(v.emptyStateText),
    manageAddTitle: cleanTextOrNull(v.manageAddTitle),
    manageAddBlurb: cleanTextOrNull(v.manageAddBlurb),
    manageOrderTitle: cleanTextOrNull(v.manageOrderTitle),
    manageOrderBlurb: cleanTextOrNull(v.manageOrderBlurb),
    manageEmptyDragText: cleanTextOrNull(v.manageEmptyDragText),
    loginTitle: cleanTextOrNull(v.loginTitle),
    loginLede: cleanTextOrNull(v.loginLede),
    loginBackLabel: cleanTextOrNull(v.loginBackLabel),
    colorPrimary: fallbackText(v.colorPrimary, DEFAULT_SITE_SETTINGS.colorPrimary),
    colorPrimaryDark: fallbackText(v.colorPrimaryDark, DEFAULT_SITE_SETTINGS.colorPrimaryDark),
    colorText: fallbackText(v.colorText, DEFAULT_SITE_SETTINGS.colorText),
    colorTextMuted: fallbackText(v.colorTextMuted, DEFAULT_SITE_SETTINGS.colorTextMuted),
    colorBorder: fallbackText(v.colorBorder, DEFAULT_SITE_SETTINGS.colorBorder),
    colorPageBg: fallbackText(v.colorPageBg, DEFAULT_SITE_SETTINGS.colorPageBg),
    colorCardBg: fallbackText(v.colorCardBg, DEFAULT_SITE_SETTINGS.colorCardBg),
    colorCardAccent: fallbackText(v.colorCardAccent, DEFAULT_SITE_SETTINGS.colorCardAccent),
    colorUrlOnCard: fallbackText(v.colorUrlOnCard, DEFAULT_SITE_SETTINGS.colorUrlOnCard),
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
};

async function saveSettings(settings: NormalizedSettings, caps: Capabilities) {
  const db = getDb();
  
  // Build columns and values dynamically to avoid "column does not exist" errors
  const columns: string[] = ["id"];
  const values: unknown[] = [1];
  const updates: string[] = [];

  const add = (col: string, val: unknown) => {
    columns.push(`"${col}"`);
    values.push(val);
    updates.push(`"${col}" = excluded."${col}"`);
  };

  if (caps.supportsLogoStorage) {
    add("logo_url", settings.logoUrl);
    add("logo_alt", settings.logoAlt);
  }
  if (caps.supportsNewLogoHeaderFields) {
    add("logo_size_px", settings.logoSizePx);
    add("header_layout", settings.headerLayout);
  }
  if (caps.supportsHeaderTitleSize) {
    add("header_title_size_px", settings.headerTitleSizePx);
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
  add("color_card_accent", settings.colorCardAccent);
  add("color_url_on_card", settings.colorUrlOnCard);
  add("card_radius_px", settings.cardRadiusPx);
  add("card_shadow", settings.cardShadow);
  add("updated_at", settings.updatedAt);

  const sqlQuery = sql.raw(`
    insert into "site_settings" (${columns.join(", ")})
    values (${values.map(() => "?").join(", ")})
    on conflict ("id") do update set
      ${updates.join(", ")}
  `);

  await db.execute(sqlQuery, values);
}

interface ColumnRow {
  column_name: string;
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireSession();
  // ... (rest of parsing logic)


  const raw = {
    logoUrl: readString(formData, "logoUrl"),
    logoAlt: readString(formData, "logoAlt"),
    logoSizePx: readString(formData, "logoSizePx"),
    headerLayout: readString(formData, "headerLayout"),
    brandLine1: readString(formData, "brandLine1"),
    brandLine2: readString(formData, "brandLine2"),
    headerTitle: readString(formData, "headerTitle"),
    headerSubtitle: readString(formData, "headerSubtitle"),
    headerTitleSizePx: readString(formData, "headerTitleSizePx"),
    heroTitle: readString(formData, "heroTitle"),
    heroLede: readString(formData, "heroLede"),
    emptyStateText: readString(formData, "emptyStateText"),
    manageAddTitle: readString(formData, "manageAddTitle"),
    manageAddBlurb: readString(formData, "manageAddBlurb"),
    manageOrderTitle: readString(formData, "manageOrderTitle"),
    manageOrderBlurb: readString(formData, "manageOrderBlurb"),
    manageEmptyDragText: readString(formData, "manageEmptyDragText"),
    loginTitle: readString(formData, "loginTitle"),
    loginLede: readString(formData, "loginLede"),
    loginBackLabel: readString(formData, "loginBackLabel"),
    colorPrimary: readString(formData, "colorPrimary"),
    colorPrimaryDark: readString(formData, "colorPrimaryDark"),
    colorText: readString(formData, "colorText"),
    colorTextMuted: readString(formData, "colorTextMuted"),
    colorBorder: readString(formData, "colorBorder"),
    colorPageBg: readString(formData, "colorPageBg"),
    colorCardBg: readString(formData, "colorCardBg"),
    colorCardAccent: readString(formData, "colorCardAccent"),
    colorUrlOnCard: readString(formData, "colorUrlOnCard"),
    cardRadiusPx: readString(formData, "cardRadiusPx"),
    cardShadow: readString(formData, "cardShadow"),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const normalized = buildNormalizedSettings(parsed.data);

  try {
    const capsResult = await getDb().execute(sql`
      select column_name
      from information_schema.columns
      where table_name = 'site_settings'
    `);
    const existingColumns = new Set((capsResult.rows as ColumnRow[]).map((r) => String(r.column_name)));
    
    const caps: Capabilities = {
      supportsLogoStorage: existingColumns.has("logo_url") && existingColumns.has("logo_alt"),
      supportsHeaderTitleSize: existingColumns.has("header_title_size_px"),
      supportsNewLogoHeaderFields: existingColumns.has("logo_size_px") && existingColumns.has("header_layout"),
    };

    await saveSettings(normalized, caps);

    const fieldErrors: Record<string, string[]> = {};
    if (!caps.supportsLogoStorage && normalized.logoUrl) {
      fieldErrors.logoUrl = ["Logo storage is not available in the database yet. Other settings were saved."];
    }
    if (!caps.supportsHeaderTitleSize && readString(formData, "headerTitleSizePx").trim() !== "") {
      fieldErrors.headerTitleSizePx = ["Custom title sizing is not available in the database yet. Other settings were saved."];
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false as const, error: fieldErrors };
    }
  } catch (error) {
    return {
      ok: false as const,
      error: {
        formErrors: [error instanceof Error ? error.message : "Could not save settings."],
      },
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/login");
  return { ok: true as const };
}
