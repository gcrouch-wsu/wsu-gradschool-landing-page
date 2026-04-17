import type { SiteSettingsRow } from "@/lib/schema";

export type ThemeSettings = Pick<
  SiteSettingsRow,
  | "colorPrimary"
  | "colorPrimaryDark"
  | "colorText"
  | "colorTextMuted"
  | "colorBorder"
  | "colorPageBg"
  | "colorCardBg"
  | "colorCardBorder"
  | "colorCardAccent"
  | "colorCardTitle"
  | "colorCardDescription"
  | "colorUrlOnCard"
  | "cardFontFamily"
  | "cardTitleSizePx"
  | "cardUrlSizePx"
  | "cardDescriptionSizePx"
  | "cardPaddingPx"
  | "cardAccentHeightPx"
  | "cardRadiusPx"
  | "cardShadow"
>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cardShadowValue(key: string): string {
  switch (key) {
    case "none":
      return "none";
    case "sm":
      return "0 2px 8px rgba(0,0,0,0.06)";
    case "lg":
      return "0 8px 24px rgba(0,0,0,0.12)";
    case "md":
    default:
      return "0 4px 14px rgba(0,0,0,0.08)";
  }
}

function cardFontFamilyValue(key: string): string {
  switch (key) {
    case "ibm-plex-sans":
      return "var(--font-ibm-plex-sans), system-ui, sans-serif";
    case "space-grotesk":
      return "var(--font-space-grotesk), system-ui, sans-serif";
    case "source-serif-4":
      return "var(--font-source-serif-4), Georgia, serif";
    case "montserrat":
    default:
      return "var(--font-montserrat), system-ui, sans-serif";
  }
}

export function buildSiteThemeCss(settings: ThemeSettings): string {
  const radius = clamp(settings.cardRadiusPx, 4, 32);
  const titleSize = clamp(settings.cardTitleSizePx, 14, 32);
  const urlSize = clamp(settings.cardUrlSizePx, 10, 24);
  const descriptionSize = clamp(settings.cardDescriptionSizePx, 12, 28);
  const padding = clamp(settings.cardPaddingPx, 12, 36);
  const accentHeight = clamp(settings.cardAccentHeightPx, 2, 16);

  return `:root {
  --wsu-crimson: ${settings.colorPrimary};
  --wsu-crimson-dark: ${settings.colorPrimaryDark};
  --wsu-gray: ${settings.colorText};
  --wsu-gray-mid: ${settings.colorTextMuted};
  --wsu-gray-light: ${settings.colorBorder};
  --wsu-bg: ${settings.colorPageBg};
  --wsu-white: #ffffff;
  --wsu-card-bg: ${settings.colorCardBg};
  --wsu-card-border: ${settings.colorCardBorder};
  --wsu-card-accent: ${settings.colorCardAccent};
  --wsu-card-title: ${settings.colorCardTitle};
  --wsu-card-description: ${settings.colorCardDescription};
  --wsu-url-on-card: ${settings.colorUrlOnCard};
  --wsu-card-font-family: ${cardFontFamilyValue(settings.cardFontFamily)};
  --wsu-card-title-size: ${titleSize}px;
  --wsu-card-url-size: ${urlSize}px;
  --wsu-card-description-size: ${descriptionSize}px;
  --wsu-card-padding: ${padding}px;
  --wsu-card-accent-height: ${accentHeight}px;
  --wsu-card-radius: ${radius}px;
  --wsu-card-shadow: ${cardShadowValue(settings.cardShadow)};
}`;
}
