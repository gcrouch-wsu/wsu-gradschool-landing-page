import type { SiteSettingsRow } from "@/lib/schema";
import { cardFontFamilies } from "@/lib/site-fonts";

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
  | "cardActionFontFamily"
  | "cardActionFontWeight"
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

export function resolveCardFontFamily(key: string): string {
  return cardFontFamilies[key as keyof typeof cardFontFamilies] ?? cardFontFamilies.montserrat;
}

function resolveActionLabelFontFamily(actionKey: string, cardKey: string): string {
  if (actionKey === "match-card") {
    return resolveCardFontFamily(cardKey);
  }
  return resolveCardFontFamily(actionKey);
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
  --wsu-card-font-family: ${resolveCardFontFamily(settings.cardFontFamily)};
  --wsu-card-action-font-family: ${resolveActionLabelFontFamily(
    settings.cardActionFontFamily,
    settings.cardFontFamily,
  )};
  --wsu-card-action-font-weight: ${settings.cardActionFontWeight};
  --wsu-card-title-size: ${titleSize}px;
  --wsu-card-url-size: ${urlSize}px;
  --wsu-card-description-size: ${descriptionSize}px;
  --wsu-card-padding: ${padding}px;
  --wsu-card-accent-height: ${accentHeight}px;
  --wsu-card-radius: ${radius}px;
  --wsu-card-shadow: ${cardShadowValue(settings.cardShadow)};
}`;
}
