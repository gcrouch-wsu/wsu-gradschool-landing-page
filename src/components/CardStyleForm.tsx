"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import type { SiteSettingsRow } from "@/lib/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";
import { resolveCardFontFamily } from "@/lib/site-theme-css";

type CardStyleSettings = Pick<
  SiteSettingsRow,
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

type Props = {
  settings: SiteSettingsRow;
  onCardSettingsChange?: (settings: CardStyleSettings) => void;
};

const WSU_COLORS = [
  { name: "Crimson", hex: "#981e32" },
  { name: "Crimson Dark", hex: "#6d1524" },
  { name: "Gray", hex: "#5e6a71" },
  { name: "Gray Dark", hex: "#393939" },
  { name: "Gray Light", hex: "#e2e2e2" },
  { name: "Off-white", hex: "#f7f5f5" },
  { name: "White", hex: "#ffffff" },
];

const cardFontChoices = [
  {
    value: "montserrat",
    label: "Montserrat",
    description: "Clean and institutional.",
  },
  {
    value: "ibm-plex-sans",
    label: "IBM Plex Sans",
    description: "Neutral and technical.",
  },
  {
    value: "space-grotesk",
    label: "Space Grotesk",
    description: "Sharper and more modern.",
  },
  {
    value: "source-serif-4",
    label: "Source Serif 4",
    description: "Editorial with more contrast.",
  },
] as const;

const actionLabelFontChoices = [
  {
    value: "match-card",
    label: "Match card font",
    description: "Use the same family as the rest of the card.",
  },
  ...cardFontChoices,
] as const;

const actionLabelWeightChoices = [
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra bold" },
] as const;

function ColorPicker({
  name,
  label,
  value,
  fallback,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
        {label}
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {WSU_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            onClick={() => onChange(color.hex)}
            className={`h-6 w-6 rounded-md border border-black/10 transition hover:scale-110 ${
              value.toLowerCase() === color.hex.toLowerCase()
                ? "ring-2 ring-[var(--wsu-crimson)] ring-offset-1"
                : ""
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
      <input
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 font-mono text-sm"
        placeholder={fallback}
      />
    </div>
  );
}

function ChoiceTile({
  name,
  value,
  selectedValue,
  label,
  description,
  previewFontFamily,
  onChange,
}: {
  name: string;
  value: string;
  selectedValue: string;
  label: string;
  description: string;
  previewFontFamily?: string;
  onChange: (value: string) => void;
}) {
  const active = selectedValue === value;

  return (
    <label
      className={`block cursor-pointer rounded-[16px] border px-4 py-3 transition ${
        active
          ? "border-[var(--wsu-crimson)] bg-[var(--wsu-crimson)]/6 shadow-[0_8px_20px_rgba(152,30,50,0.08)]"
          : "border-[var(--wsu-gray-light)] bg-white hover:border-[var(--wsu-gray-mid)]/35 hover:bg-[var(--wsu-bg)]/70"
      }`}
      style={previewFontFamily ? { fontFamily: previewFontFamily } : undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={active}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <span className="block text-sm font-semibold text-[var(--wsu-gray)]">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-[var(--wsu-gray-mid)]">
        {description}
      </span>
    </label>
  );
}

export function CardStyleForm({ settings, onCardSettingsChange }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    colorCardBg: settings.colorCardBg ?? DEFAULT_SITE_SETTINGS.colorCardBg,
    colorCardBorder: settings.colorCardBorder ?? DEFAULT_SITE_SETTINGS.colorCardBorder,
    colorCardAccent: settings.colorCardAccent ?? DEFAULT_SITE_SETTINGS.colorCardAccent,
    colorCardTitle: settings.colorCardTitle ?? DEFAULT_SITE_SETTINGS.colorCardTitle,
    colorCardDescription:
      settings.colorCardDescription ?? DEFAULT_SITE_SETTINGS.colorCardDescription,
    colorUrlOnCard: settings.colorUrlOnCard ?? DEFAULT_SITE_SETTINGS.colorUrlOnCard,
    cardFontFamily: settings.cardFontFamily ?? DEFAULT_SITE_SETTINGS.cardFontFamily,
    cardActionFontFamily:
      settings.cardActionFontFamily ?? DEFAULT_SITE_SETTINGS.cardActionFontFamily,
    cardActionFontWeight:
      settings.cardActionFontWeight ?? DEFAULT_SITE_SETTINGS.cardActionFontWeight,
    cardTitleSizePx: String(settings.cardTitleSizePx ?? DEFAULT_SITE_SETTINGS.cardTitleSizePx),
    cardUrlSizePx: String(settings.cardUrlSizePx ?? DEFAULT_SITE_SETTINGS.cardUrlSizePx),
    cardDescriptionSizePx: String(
      settings.cardDescriptionSizePx ?? DEFAULT_SITE_SETTINGS.cardDescriptionSizePx,
    ),
    cardPaddingPx: String(settings.cardPaddingPx ?? DEFAULT_SITE_SETTINGS.cardPaddingPx),
    cardAccentHeightPx: String(
      settings.cardAccentHeightPx ?? DEFAULT_SITE_SETTINGS.cardAccentHeightPx,
    ),
    cardRadiusPx: String(settings.cardRadiusPx ?? DEFAULT_SITE_SETTINGS.cardRadiusPx),
    cardShadow: settings.cardShadow ?? DEFAULT_SITE_SETTINGS.cardShadow,
  });

  function buildLiveCardSettings(values: typeof formValues): CardStyleSettings {
    return {
      colorCardBg: values.colorCardBg.trim() || DEFAULT_SITE_SETTINGS.colorCardBg,
      colorCardBorder: values.colorCardBorder.trim() || DEFAULT_SITE_SETTINGS.colorCardBorder,
      colorCardAccent: values.colorCardAccent.trim() || DEFAULT_SITE_SETTINGS.colorCardAccent,
      colorCardTitle: values.colorCardTitle.trim() || DEFAULT_SITE_SETTINGS.colorCardTitle,
      colorCardDescription:
        values.colorCardDescription.trim() || DEFAULT_SITE_SETTINGS.colorCardDescription,
      colorUrlOnCard: values.colorUrlOnCard.trim() || DEFAULT_SITE_SETTINGS.colorUrlOnCard,
      cardFontFamily:
        (values.cardFontFamily as SiteSettingsRow["cardFontFamily"]) ??
        DEFAULT_SITE_SETTINGS.cardFontFamily,
      cardActionFontFamily:
        (values.cardActionFontFamily as SiteSettingsRow["cardActionFontFamily"]) ??
        DEFAULT_SITE_SETTINGS.cardActionFontFamily,
      cardActionFontWeight:
        (values.cardActionFontWeight as SiteSettingsRow["cardActionFontWeight"]) ??
        DEFAULT_SITE_SETTINGS.cardActionFontWeight,
      cardTitleSizePx:
        values.cardTitleSizePx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardTitleSizePx
          : Number(values.cardTitleSizePx),
      cardUrlSizePx:
        values.cardUrlSizePx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardUrlSizePx
          : Number(values.cardUrlSizePx),
      cardDescriptionSizePx:
        values.cardDescriptionSizePx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardDescriptionSizePx
          : Number(values.cardDescriptionSizePx),
      cardPaddingPx:
        values.cardPaddingPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardPaddingPx
          : Number(values.cardPaddingPx),
      cardAccentHeightPx:
        values.cardAccentHeightPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardAccentHeightPx
          : Number(values.cardAccentHeightPx),
      cardRadiusPx:
        values.cardRadiusPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.cardRadiusPx
          : Number(values.cardRadiusPx),
      cardShadow:
        (values.cardShadow as SiteSettingsRow["cardShadow"]) ??
        DEFAULT_SITE_SETTINGS.cardShadow,
    };
  }

  function handleFieldChange(name: string, value: string) {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value };
      onCardSettingsChange?.(buildLiveCardSettings(next));
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateSiteSettingsAction(formData);
      if (res.saved) {
        router.refresh();
      }
      if (res.ok) {
        setBanner("Card styling saved successfully.");
        return;
      }
      const parts = Object.entries(res.error)
        .flatMap(([, value]) => value ?? [])
        .filter(Boolean);
      setBanner(parts.length ? parts.join(" ") : "Check your inputs.");
    } catch {
      setBanner("Could not save card styling.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-[var(--wsu-gray-light)] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl">
        <h3 className="text-lg font-bold text-[var(--wsu-gray)]">Card styling</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
          The cards in this tab use the actual `AppTile` rendering. Typography, spacing, colors,
          and the card action label update live while you edit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {banner ? (
          <p
            className={`rounded-xl px-3 py-2 text-sm ${
              banner.includes("saved") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {banner}
          </p>
        ) : null}

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Typography</legend>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Card font family
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
                Changes the typography across the title, description, and action label.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cardFontChoices.map((choice) => (
                <ChoiceTile
                  key={choice.value}
                  name="cardFontFamily"
                  value={choice.value}
                  selectedValue={formValues.cardFontFamily}
                  label={choice.label}
                  description={choice.description}
                  previewFontFamily={resolveCardFontFamily(choice.value)}
                  onChange={(value) => handleFieldChange("cardFontFamily", value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Action label font family
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
                Style the `Open tool` link independently from the rest of the card.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {actionLabelFontChoices.map((choice) => (
                <ChoiceTile
                  key={choice.value}
                  name="cardActionFontFamily"
                  value={choice.value}
                  selectedValue={formValues.cardActionFontFamily}
                  label={choice.label}
                  description={choice.description}
                  previewFontFamily={resolveCardFontFamily(
                    choice.value === "match-card" ? formValues.cardFontFamily : choice.value,
                  )}
                  onChange={(value) => handleFieldChange("cardActionFontFamily", value)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Title size (px)
              <input
                name="cardTitleSizePx"
                type="number"
                min={14}
                max={32}
                value={formValues.cardTitleSizePx}
                onChange={(e) => handleFieldChange("cardTitleSizePx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Action label size (px)
              <input
                name="cardUrlSizePx"
                type="number"
                min={10}
                max={24}
                value={formValues.cardUrlSizePx}
                onChange={(e) => handleFieldChange("cardUrlSizePx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Action label weight
              <select
                name="cardActionFontWeight"
                value={formValues.cardActionFontWeight}
                onChange={(e) => handleFieldChange("cardActionFontWeight", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              >
                {actionLabelWeightChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Description size (px)
              <input
                name="cardDescriptionSizePx"
                type="number"
                min={12}
                max={28}
                value={formValues.cardDescriptionSizePx}
                onChange={(e) => handleFieldChange("cardDescriptionSizePx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Surface</legend>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Inner padding (px)
              <input
                name="cardPaddingPx"
                type="number"
                min={12}
                max={36}
                value={formValues.cardPaddingPx}
                onChange={(e) => handleFieldChange("cardPaddingPx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Accent stripe (px)
              <input
                name="cardAccentHeightPx"
                type="number"
                min={2}
                max={16}
                value={formValues.cardAccentHeightPx}
                onChange={(e) => handleFieldChange("cardAccentHeightPx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Corner radius (px)
              <input
                name="cardRadiusPx"
                type="number"
                min={4}
                max={32}
                value={formValues.cardRadiusPx}
                onChange={(e) => handleFieldChange("cardRadiusPx", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Shadow
              <select
                name="cardShadow"
                value={formValues.cardShadow}
                onChange={(e) => handleFieldChange("cardShadow", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Colors</legend>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <ColorPicker
              name="colorCardBg"
              label="Card background"
              value={formValues.colorCardBg}
              fallback={DEFAULT_SITE_SETTINGS.colorCardBg}
              onChange={(hex) => handleFieldChange("colorCardBg", hex)}
            />
            <ColorPicker
              name="colorCardBorder"
              label="Card border"
              value={formValues.colorCardBorder}
              fallback={DEFAULT_SITE_SETTINGS.colorCardBorder}
              onChange={(hex) => handleFieldChange("colorCardBorder", hex)}
            />
            <ColorPicker
              name="colorCardAccent"
              label="Card stripe"
              value={formValues.colorCardAccent}
              fallback={DEFAULT_SITE_SETTINGS.colorCardAccent}
              onChange={(hex) => handleFieldChange("colorCardAccent", hex)}
            />
            <ColorPicker
              name="colorCardTitle"
              label="Title color"
              value={formValues.colorCardTitle}
              fallback={DEFAULT_SITE_SETTINGS.colorCardTitle}
              onChange={(hex) => handleFieldChange("colorCardTitle", hex)}
            />
            <ColorPicker
              name="colorCardDescription"
              label="Description color"
              value={formValues.colorCardDescription}
              fallback={DEFAULT_SITE_SETTINGS.colorCardDescription}
              onChange={(hex) => handleFieldChange("colorCardDescription", hex)}
            />
            <ColorPicker
              name="colorUrlOnCard"
              label="Action label color"
              value={formValues.colorUrlOnCard}
              fallback={DEFAULT_SITE_SETTINGS.colorUrlOnCard}
              onChange={(hex) => handleFieldChange("colorUrlOnCard", hex)}
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 rounded-[18px] bg-[var(--wsu-bg)] px-4 py-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--wsu-gray-mid)]">
            The cards below update as you edit, then Save card styling persists the current look.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--wsu-crimson)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save card styling"}
          </button>
        </div>
      </form>
    </section>
  );
}
