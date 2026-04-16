"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  DEFAULT_SITE_SETTINGS,
  siteSettingsSupportLogoColumns,
} from "@/lib/settings";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const shadowValues = ["none", "sm", "md", "lg"] as const;

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

const radiusOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : Number(text);
  },
  z
    .number()
    .int()
    .min(4, "Use a value between 4 and 32")
    .max(32, "Use a value between 4 and 32")
    .optional(),
);

const shadowOrBlank = z.preprocess(
  (value) => {
    const text = String(value ?? "").trim();
    return text === "" ? undefined : text;
  },
  z.enum(shadowValues).optional(),
);

const settingsSchema = z.object({
  logoUrl: logoUrlOrBlank,
  logoAlt: textOrBlank(160),
  brandLine1: textOrBlank(40),
  brandLine2: textOrBlank(40),
  headerTitle: textOrBlank(120),
  headerSubtitle: textOrBlank(200),
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
  cardRadiusPx: radiusOrBlank,
  cardShadow: shadowOrBlank,
});

type NormalizedSettings = ReturnType<typeof buildNormalizedSettings>;

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function fallbackText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildNormalizedSettings(v: z.infer<typeof settingsSchema>) {
  const headerTitle = fallbackText(v.headerTitle, DEFAULT_SITE_SETTINGS.headerTitle);
  const logoUrl = v.logoUrl || null;

  return {
    logoUrl,
    logoAlt: logoUrl ? fallbackText(v.logoAlt, `${headerTitle} logo`) : null,
    brandLine1: fallbackText(v.brandLine1, DEFAULT_SITE_SETTINGS.brandLine1),
    brandLine2: fallbackText(v.brandLine2, DEFAULT_SITE_SETTINGS.brandLine2),
    headerTitle,
    headerSubtitle: fallbackText(v.headerSubtitle, DEFAULT_SITE_SETTINGS.headerSubtitle),
    heroTitle: fallbackText(v.heroTitle, DEFAULT_SITE_SETTINGS.heroTitle),
    heroLede: fallbackText(v.heroLede, DEFAULT_SITE_SETTINGS.heroLede),
    emptyStateText: fallbackText(v.emptyStateText, DEFAULT_SITE_SETTINGS.emptyStateText),
    manageAddTitle: fallbackText(v.manageAddTitle, DEFAULT_SITE_SETTINGS.manageAddTitle),
    manageAddBlurb: fallbackText(v.manageAddBlurb, DEFAULT_SITE_SETTINGS.manageAddBlurb),
    manageOrderTitle: fallbackText(v.manageOrderTitle, DEFAULT_SITE_SETTINGS.manageOrderTitle),
    manageOrderBlurb: fallbackText(v.manageOrderBlurb, DEFAULT_SITE_SETTINGS.manageOrderBlurb),
    manageEmptyDragText: fallbackText(
      v.manageEmptyDragText,
      DEFAULT_SITE_SETTINGS.manageEmptyDragText,
    ),
    loginTitle: fallbackText(v.loginTitle, DEFAULT_SITE_SETTINGS.loginTitle),
    loginLede: fallbackText(v.loginLede, DEFAULT_SITE_SETTINGS.loginLede),
    loginBackLabel: fallbackText(v.loginBackLabel, DEFAULT_SITE_SETTINGS.loginBackLabel),
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

async function saveLegacySettings(settings: NormalizedSettings) {
  const db = getDb();
  await db.execute(sql`
    insert into "site_settings" (
      "id",
      "brand_line1",
      "brand_line2",
      "header_title",
      "header_subtitle",
      "hero_title",
      "hero_lede",
      "empty_state_text",
      "manage_add_title",
      "manage_add_blurb",
      "manage_order_title",
      "manage_order_blurb",
      "manage_empty_drag_text",
      "login_title",
      "login_lede",
      "login_back_label",
      "color_primary",
      "color_primary_dark",
      "color_text",
      "color_text_muted",
      "color_border",
      "color_page_bg",
      "color_card_bg",
      "color_card_accent",
      "color_url_on_card",
      "card_radius_px",
      "card_shadow",
      "updated_at"
    ) values (
      1,
      ${settings.brandLine1},
      ${settings.brandLine2},
      ${settings.headerTitle},
      ${settings.headerSubtitle},
      ${settings.heroTitle},
      ${settings.heroLede},
      ${settings.emptyStateText},
      ${settings.manageAddTitle},
      ${settings.manageAddBlurb},
      ${settings.manageOrderTitle},
      ${settings.manageOrderBlurb},
      ${settings.manageEmptyDragText},
      ${settings.loginTitle},
      ${settings.loginLede},
      ${settings.loginBackLabel},
      ${settings.colorPrimary},
      ${settings.colorPrimaryDark},
      ${settings.colorText},
      ${settings.colorTextMuted},
      ${settings.colorBorder},
      ${settings.colorPageBg},
      ${settings.colorCardBg},
      ${settings.colorCardAccent},
      ${settings.colorUrlOnCard},
      ${settings.cardRadiusPx},
      ${settings.cardShadow},
      ${settings.updatedAt}
    )
    on conflict ("id") do update set
      "brand_line1" = excluded."brand_line1",
      "brand_line2" = excluded."brand_line2",
      "header_title" = excluded."header_title",
      "header_subtitle" = excluded."header_subtitle",
      "hero_title" = excluded."hero_title",
      "hero_lede" = excluded."hero_lede",
      "empty_state_text" = excluded."empty_state_text",
      "manage_add_title" = excluded."manage_add_title",
      "manage_add_blurb" = excluded."manage_add_blurb",
      "manage_order_title" = excluded."manage_order_title",
      "manage_order_blurb" = excluded."manage_order_blurb",
      "manage_empty_drag_text" = excluded."manage_empty_drag_text",
      "login_title" = excluded."login_title",
      "login_lede" = excluded."login_lede",
      "login_back_label" = excluded."login_back_label",
      "color_primary" = excluded."color_primary",
      "color_primary_dark" = excluded."color_primary_dark",
      "color_text" = excluded."color_text",
      "color_text_muted" = excluded."color_text_muted",
      "color_border" = excluded."color_border",
      "color_page_bg" = excluded."color_page_bg",
      "color_card_bg" = excluded."color_card_bg",
      "color_card_accent" = excluded."color_card_accent",
      "color_url_on_card" = excluded."color_url_on_card",
      "card_radius_px" = excluded."card_radius_px",
      "card_shadow" = excluded."card_shadow",
      "updated_at" = excluded."updated_at"
  `);
}

async function saveLogoSettings(settings: NormalizedSettings) {
  const db = getDb();
  await db.execute(sql`
    insert into "site_settings" (
      "id",
      "logo_url",
      "logo_alt",
      "brand_line1",
      "brand_line2",
      "header_title",
      "header_subtitle",
      "hero_title",
      "hero_lede",
      "empty_state_text",
      "manage_add_title",
      "manage_add_blurb",
      "manage_order_title",
      "manage_order_blurb",
      "manage_empty_drag_text",
      "login_title",
      "login_lede",
      "login_back_label",
      "color_primary",
      "color_primary_dark",
      "color_text",
      "color_text_muted",
      "color_border",
      "color_page_bg",
      "color_card_bg",
      "color_card_accent",
      "color_url_on_card",
      "card_radius_px",
      "card_shadow",
      "updated_at"
    ) values (
      1,
      ${settings.logoUrl},
      ${settings.logoAlt},
      ${settings.brandLine1},
      ${settings.brandLine2},
      ${settings.headerTitle},
      ${settings.headerSubtitle},
      ${settings.heroTitle},
      ${settings.heroLede},
      ${settings.emptyStateText},
      ${settings.manageAddTitle},
      ${settings.manageAddBlurb},
      ${settings.manageOrderTitle},
      ${settings.manageOrderBlurb},
      ${settings.manageEmptyDragText},
      ${settings.loginTitle},
      ${settings.loginLede},
      ${settings.loginBackLabel},
      ${settings.colorPrimary},
      ${settings.colorPrimaryDark},
      ${settings.colorText},
      ${settings.colorTextMuted},
      ${settings.colorBorder},
      ${settings.colorPageBg},
      ${settings.colorCardBg},
      ${settings.colorCardAccent},
      ${settings.colorUrlOnCard},
      ${settings.cardRadiusPx},
      ${settings.cardShadow},
      ${settings.updatedAt}
    )
    on conflict ("id") do update set
      "logo_url" = excluded."logo_url",
      "logo_alt" = excluded."logo_alt",
      "brand_line1" = excluded."brand_line1",
      "brand_line2" = excluded."brand_line2",
      "header_title" = excluded."header_title",
      "header_subtitle" = excluded."header_subtitle",
      "hero_title" = excluded."hero_title",
      "hero_lede" = excluded."hero_lede",
      "empty_state_text" = excluded."empty_state_text",
      "manage_add_title" = excluded."manage_add_title",
      "manage_add_blurb" = excluded."manage_add_blurb",
      "manage_order_title" = excluded."manage_order_title",
      "manage_order_blurb" = excluded."manage_order_blurb",
      "manage_empty_drag_text" = excluded."manage_empty_drag_text",
      "login_title" = excluded."login_title",
      "login_lede" = excluded."login_lede",
      "login_back_label" = excluded."login_back_label",
      "color_primary" = excluded."color_primary",
      "color_primary_dark" = excluded."color_primary_dark",
      "color_text" = excluded."color_text",
      "color_text_muted" = excluded."color_text_muted",
      "color_border" = excluded."color_border",
      "color_page_bg" = excluded."color_page_bg",
      "color_card_bg" = excluded."color_card_bg",
      "color_card_accent" = excluded."color_card_accent",
      "color_url_on_card" = excluded."color_url_on_card",
      "card_radius_px" = excluded."card_radius_px",
      "card_shadow" = excluded."card_shadow",
      "updated_at" = excluded."updated_at"
  `);
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireSession();

  const raw = {
    logoUrl: readString(formData, "logoUrl"),
    logoAlt: readString(formData, "logoAlt"),
    brandLine1: readString(formData, "brandLine1"),
    brandLine2: readString(formData, "brandLine2"),
    headerTitle: readString(formData, "headerTitle"),
    headerSubtitle: readString(formData, "headerSubtitle"),
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
  const requestedLogo = Boolean(normalized.logoUrl);

  try {
    const supportsLogoStorage = await siteSettingsSupportLogoColumns();
    if (supportsLogoStorage) {
      await saveLogoSettings(normalized);
    } else {
      await saveLegacySettings(normalized);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings right now.";
    const missingLogoColumn =
      message.includes("logo_url") || message.includes("logo_alt") || message.includes("site_settings");

    if (missingLogoColumn) {
      try {
        await saveLegacySettings(normalized);
      } catch (retryError) {
        return {
          ok: false as const,
          error: {
            formErrors: [
              retryError instanceof Error
                ? retryError.message
                : "Could not save settings right now.",
            ],
          },
        };
      }

      if (requestedLogo) {
        return {
          ok: false as const,
          error: {
            logoUrl: [
              "Logo storage is not available until the database migration is applied. Other settings were saved.",
            ],
          },
        };
      }
    } else {
      return {
        ok: false as const,
        error: {
          formErrors: [message],
        },
      };
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/login");
  return { ok: true as const };
}
