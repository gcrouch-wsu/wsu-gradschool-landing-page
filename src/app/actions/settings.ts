"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";
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

const radiusOrBlank = z.preprocess((value) => {
  const text = String(value ?? "").trim();
  return text === "" ? undefined : Number(text);
}, z.number().int().min(4, "Use a value between 4 and 32").max(32, "Use a value between 4 and 32").optional());

const shadowOrBlank = z.preprocess((value) => {
  const text = String(value ?? "").trim();
  return text === "" ? undefined : text;
}, z.enum(shadowValues).optional());

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

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function fallbackText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    throw new Error("Unauthorized");
  }
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

  const v = parsed.data;
  const headerTitle = fallbackText(v.headerTitle, DEFAULT_SITE_SETTINGS.headerTitle);
  const logoUrl = v.logoUrl || null;

  const nextSettings = {
    id: 1,
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

  const db = getDb();
  await db
    .insert(siteSettings)
    .values(nextSettings)
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: nextSettings,
    });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/manage");
  revalidatePath("/login");
  return { ok: true as const };
}
