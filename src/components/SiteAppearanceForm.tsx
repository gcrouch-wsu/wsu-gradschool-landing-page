"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import type { SiteSettingsRow } from "@/lib/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";

type Props = {
  settings: SiteSettingsRow;
  supportsLogoStorage: boolean;
  onHeaderSettingsChange?: (settings: Pick<
    SiteSettingsRow,
    | "brandLine1"
    | "brandLine2"
    | "headerTitle"
    | "headerSubtitle"
    | "headerTitleSizePx"
    | "headerTextPaddingTopPx"
    | "headerTextPaddingBottomPx"
    | "headerTitleSubtitleGapPx"
    | "logoUrl"
    | "logoAlt"
    | "logoSizePx"
    | "headerLayout"
    | "headerPlacement"
    | "colorPrimary"
    | "colorPrimaryDark"
    | "colorText"
    | "colorTextMuted"
    | "colorBorder"
    | "colorPageBg"
  >) => void;
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
      <div className="flex flex-wrap gap-1.5 mb-2">
        {WSU_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            onClick={() => onChange(c.hex)}
            className={`h-6 w-6 rounded-md border border-black/10 transition hover:scale-110 ${
              value.toLowerCase() === c.hex.toLowerCase()
                ? "ring-2 ring-[var(--wsu-crimson)] ring-offset-1"
                : ""
            }`}
            style={{ backgroundColor: c.hex }}
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
  onChange,
}: {
  name: string;
  value: string;
  selectedValue: string;
  label: string;
  description: string;
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

export function SiteAppearanceForm({
  settings,
  supportsLogoStorage,
  onHeaderSettingsChange,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    logoUrl: settings.logoUrl ?? "",
    logoAlt: settings.logoAlt ?? "",
    logoSizePx: String(settings.logoSizePx ?? DEFAULT_SITE_SETTINGS.logoSizePx),
    headerLayout: settings.headerLayout ?? "side",
    headerPlacement: settings.headerPlacement ?? DEFAULT_SITE_SETTINGS.headerPlacement,
    brandLine1: settings.brandLine1 ?? "",
    brandLine2: settings.brandLine2 ?? "",
    headerTitle: settings.headerTitle ?? "",
    headerSubtitle: settings.headerSubtitle ?? "",
    headerTitleSizePx: String(settings.headerTitleSizePx ?? DEFAULT_SITE_SETTINGS.headerTitleSizePx),
    headerTextPaddingTopPx: String(
      settings.headerTextPaddingTopPx ?? DEFAULT_SITE_SETTINGS.headerTextPaddingTopPx,
    ),
    headerTextPaddingBottomPx: String(
      settings.headerTextPaddingBottomPx ?? DEFAULT_SITE_SETTINGS.headerTextPaddingBottomPx,
    ),
    headerTitleSubtitleGapPx: String(
      settings.headerTitleSubtitleGapPx ?? DEFAULT_SITE_SETTINGS.headerTitleSubtitleGapPx,
    ),
    heroTitle: settings.heroTitle ?? "",
    heroLede: settings.heroLede ?? "",
    emptyStateText: settings.emptyStateText ?? "",
    loginTitle: settings.loginTitle ?? "",
    loginLede: settings.loginLede ?? "",
    loginBackLabel: settings.loginBackLabel ?? "",
    manageAddTitle: settings.manageAddTitle ?? "",
    manageAddBlurb: settings.manageAddBlurb ?? "",
    manageOrderTitle: settings.manageOrderTitle ?? "",
    manageOrderBlurb: settings.manageOrderBlurb ?? "",
    manageEmptyDragText: settings.manageEmptyDragText ?? "",
    colorPrimary: settings.colorPrimary ?? DEFAULT_SITE_SETTINGS.colorPrimary,
    colorPrimaryDark: settings.colorPrimaryDark ?? DEFAULT_SITE_SETTINGS.colorPrimaryDark,
    colorText: settings.colorText ?? DEFAULT_SITE_SETTINGS.colorText,
    colorTextMuted: settings.colorTextMuted ?? DEFAULT_SITE_SETTINGS.colorTextMuted,
    colorBorder: settings.colorBorder ?? DEFAULT_SITE_SETTINGS.colorBorder,
    colorPageBg: settings.colorPageBg ?? DEFAULT_SITE_SETTINGS.colorPageBg,
  });

  function buildLiveHeaderSettings(values: typeof formValues) {
    return {
      brandLine1: values.brandLine1.trim() || "",
      brandLine2: values.brandLine2.trim() || "",
      headerTitle: values.headerTitle.trim() || "",
      headerSubtitle: values.headerSubtitle.trim() || "",
      headerTitleSizePx:
        values.headerTitleSizePx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.headerTitleSizePx
          : Number(values.headerTitleSizePx),
      headerTextPaddingTopPx:
        values.headerTextPaddingTopPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.headerTextPaddingTopPx
          : Number(values.headerTextPaddingTopPx),
      headerTextPaddingBottomPx:
        values.headerTextPaddingBottomPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.headerTextPaddingBottomPx
          : Number(values.headerTextPaddingBottomPx),
      headerTitleSubtitleGapPx:
        values.headerTitleSubtitleGapPx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.headerTitleSubtitleGapPx
          : Number(values.headerTitleSubtitleGapPx),
      logoUrl: values.logoUrl.trim() || null,
      logoAlt: values.logoAlt.trim() || null,
      logoSizePx:
        values.logoSizePx.trim() === ""
          ? DEFAULT_SITE_SETTINGS.logoSizePx
          : Number(values.logoSizePx),
      headerLayout: values.headerLayout as SiteSettingsRow["headerLayout"],
      headerPlacement: values.headerPlacement as SiteSettingsRow["headerPlacement"],
      colorPrimary: values.colorPrimary.trim() || DEFAULT_SITE_SETTINGS.colorPrimary,
      colorPrimaryDark: values.colorPrimaryDark.trim() || DEFAULT_SITE_SETTINGS.colorPrimaryDark,
      colorText: values.colorText.trim() || DEFAULT_SITE_SETTINGS.colorText,
      colorTextMuted: values.colorTextMuted.trim() || DEFAULT_SITE_SETTINGS.colorTextMuted,
      colorBorder: values.colorBorder.trim() || DEFAULT_SITE_SETTINGS.colorBorder,
      colorPageBg: values.colorPageBg.trim() || DEFAULT_SITE_SETTINGS.colorPageBg,
    };
  }

  function handleFieldChange(name: string, value: string) {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value };
      onHeaderSettingsChange?.(buildLiveHeaderSettings(next));
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      // No more auto-populating empty fields with defaults on submit!
      const res = await updateSiteSettingsAction(fd);
      if (res.saved) {
        router.refresh();
      }
      if (res.ok) {
        setBanner("Settings saved successfully.");
        return;
      }
      const parts = Object.entries(res.error)
        .flatMap(([, value]) => value ?? [])
        .filter(Boolean);
      setBanner(parts.length ? parts.join(" ") : "Check your inputs.");
    } catch {
      setBanner("Could not save settings.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mb-10 rounded-[18px] border border-[var(--wsu-gray-light)] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-[var(--wsu-gray)]">Page and appearance</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
            Update the public page, login screen, and header branding from one place. Card
            styling lives in the Card order and styling tab.
          </p>
        </div>
        <div className="max-w-sm rounded-[18px] bg-[var(--wsu-bg)] px-4 py-3 text-sm leading-6 text-[var(--wsu-gray-mid)] ring-1 ring-black/5">
          Text fields are optional. Clear any copy field and save to hide it on the site. The
          actual header above updates live while you edit. Color inputs still fall back to
          their built-in defaults when left blank.
          {supportsLogoStorage
            ? " Add a logo URL to replace the text mark in the upper-left header."
            : " The header currently uses the text mark because this database has not enabled logo storage yet."}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {banner ? (
          <p className={`rounded-xl px-3 py-2 text-sm ${banner.includes("saved") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {banner}
          </p>
        ) : null}

        <div className="grid gap-6">
          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Logo and header</legend>

            <p className="text-sm leading-6 text-[var(--wsu-gray-mid)]">
              The actual header above updates as you type. Use the controls here to move the
              site title around the brand mark and action buttons.
            </p>

            {supportsLogoStorage ? (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                  Logo image URL <span className="font-normal normal-case">(optional)</span>
                  <input
                    name="logoUrl"
                    value={formValues.logoUrl}
                    onChange={(e) => handleFieldChange("logoUrl", e.target.value)}
                    inputMode="url"
                    className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                    placeholder="https://example.edu/logo.svg"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                    Logo size (max-width px)
                    <input
                      name="logoSizePx"
                      type="number"
                      min={40}
                      max={400}
                      value={formValues.logoSizePx}
                      onChange={(e) => handleFieldChange("logoSizePx", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                    Logo alt text <span className="font-normal normal-case">(optional)</span>
                    <input
                      name="logoAlt"
                      value={formValues.logoAlt}
                      onChange={(e) => handleFieldChange("logoAlt", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                      placeholder="Graduate School logo"
                    />
                  </label>
                </div>
              </>
            ) : (
              <p className="rounded-[16px] bg-[var(--wsu-bg)] px-4 py-3 text-sm leading-6 text-[var(--wsu-gray-mid)] ring-1 ring-black/5">
                This database does not support stored logo fields yet, so the header currently
                uses the text mark below.
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                    Brand mark layout
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
                    Control whether the logo or text mark sits beside the title or above it.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceTile
                    name="headerLayout"
                    value="side"
                    selectedValue={formValues.headerLayout}
                    label="Mark beside title"
                    description="Keeps the brand mark and site title on one line when space allows."
                    onChange={(value) => handleFieldChange("headerLayout", value)}
                  />
                  <ChoiceTile
                    name="headerLayout"
                    value="stacked"
                    selectedValue={formValues.headerLayout}
                    label="Mark above title"
                    description="Stacks the brand mark on top of the title for a taller header."
                    onChange={(value) => handleFieldChange("headerLayout", value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                    Title and buttons
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
                    Choose where the site title sits relative to the header action buttons.
                  </p>
                </div>
                <div className="grid gap-3 xl:grid-cols-3">
                  <ChoiceTile
                    name="headerPlacement"
                    value="split"
                    selectedValue={formValues.headerPlacement}
                    label="Split"
                    description="Title and brand on the left, action buttons on the right."
                    onChange={(value) => handleFieldChange("headerPlacement", value)}
                  />
                  <ChoiceTile
                    name="headerPlacement"
                    value="stacked"
                    selectedValue={formValues.headerPlacement}
                    label="Stacked"
                    description="Title block first, action buttons below it on the right."
                    onChange={(value) => handleFieldChange("headerPlacement", value)}
                  />
                  <ChoiceTile
                    name="headerPlacement"
                    value="centered"
                    selectedValue={formValues.headerPlacement}
                    label="Centered"
                    description="Centers the full header and buttons for a more symmetrical layout."
                    onChange={(value) => handleFieldChange("headerPlacement", value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Text mark line 1
                <input
                  name="brandLine1"
                  value={formValues.brandLine1}
                  onChange={(e) => handleFieldChange("brandLine1", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                  placeholder={DEFAULT_SITE_SETTINGS.brandLine1 || ""}
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Text mark line 2
                <input
                  name="brandLine2"
                  value={formValues.brandLine2}
                  onChange={(e) => handleFieldChange("brandLine2", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                  placeholder={DEFAULT_SITE_SETTINGS.brandLine2 || ""}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Site title
              <input
                name="headerTitle"
                value={formValues.headerTitle}
                onChange={(e) => handleFieldChange("headerTitle", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.headerTitle || ""}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Site subtitle
                <input
                  name="headerSubtitle"
                  value={formValues.headerSubtitle}
                  onChange={(e) => handleFieldChange("headerSubtitle", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                  placeholder={DEFAULT_SITE_SETTINGS.headerSubtitle || ""}
                />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Title size (px)
                <input
                  name="headerTitleSizePx"
                  type="number"
                  min={18}
                  max={48}
                  value={formValues.headerTitleSizePx}
                  onChange={(e) => handleFieldChange("headerTitleSizePx", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Title top padding (px)
                <input
                  name="headerTextPaddingTopPx"
                  type="number"
                  min={0}
                  max={48}
                  value={formValues.headerTextPaddingTopPx}
                  onChange={(e) => handleFieldChange("headerTextPaddingTopPx", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Title bottom padding (px)
                <input
                  name="headerTextPaddingBottomPx"
                  type="number"
                  min={0}
                  max={48}
                  value={formValues.headerTextPaddingBottomPx}
                  onChange={(e) => handleFieldChange("headerTextPaddingBottomPx", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Title/subtitle gap (px)
                <input
                  name="headerTitleSubtitleGapPx"
                  type="number"
                  min={0}
                  max={32}
                  value={formValues.headerTitleSubtitleGapPx}
                  onChange={(e) => handleFieldChange("headerTitleSubtitleGapPx", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Public page</legend>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Section heading
              <input
                name="heroTitle"
                value={formValues.heroTitle}
                onChange={(e) => handleFieldChange("heroTitle", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.heroTitle || ""}
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Intro paragraph
              <textarea
                name="heroLede"
                rows={4}
                value={formValues.heroLede}
                onChange={(e) => handleFieldChange("heroLede", e.target.value)}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.heroLede || ""}
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Empty state message
              <textarea
                name="emptyStateText"
                rows={3}
                value={formValues.emptyStateText}
                onChange={(e) => handleFieldChange("emptyStateText", e.target.value)}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.emptyStateText || ""}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Login page</legend>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Page title
              <input
                name="loginTitle"
                value={formValues.loginTitle}
                onChange={(e) => handleFieldChange("loginTitle", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.loginTitle || ""}
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Intro paragraph
              <textarea
                name="loginLede"
                rows={4}
                value={formValues.loginLede}
                onChange={(e) => handleFieldChange("loginLede", e.target.value)}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.loginLede || ""}
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Back link label
              <input
                name="loginBackLabel"
                value={formValues.loginBackLabel}
                onChange={(e) => handleFieldChange("loginBackLabel", e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                placeholder={DEFAULT_SITE_SETTINGS.loginBackLabel || ""}
              />
            </label>
          </fieldset>
        </div>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Colors</legend>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <ColorPicker
              name="colorPrimary"
              label="Primary Crimson"
              value={formValues.colorPrimary}
              fallback={DEFAULT_SITE_SETTINGS.colorPrimary}
              onChange={(hex) => handleFieldChange("colorPrimary", hex)}
            />
            <ColorPicker
              name="colorPrimaryDark"
              label="Primary Hover"
              value={formValues.colorPrimaryDark}
              fallback={DEFAULT_SITE_SETTINGS.colorPrimaryDark}
              onChange={(hex) => handleFieldChange("colorPrimaryDark", hex)}
            />
            <ColorPicker
              name="colorText"
              label="Main Text"
              value={formValues.colorText}
              fallback={DEFAULT_SITE_SETTINGS.colorText}
              onChange={(hex) => handleFieldChange("colorText", hex)}
            />
            <ColorPicker
              name="colorTextMuted"
              label="Muted Text"
              value={formValues.colorTextMuted}
              fallback={DEFAULT_SITE_SETTINGS.colorTextMuted}
              onChange={(hex) => handleFieldChange("colorTextMuted", hex)}
            />
            <ColorPicker
              name="colorBorder"
              label="Borders"
              value={formValues.colorBorder}
              fallback={DEFAULT_SITE_SETTINGS.colorBorder}
              onChange={(hex) => handleFieldChange("colorBorder", hex)}
            />
            <ColorPicker
              name="colorPageBg"
              label="Page Background"
              value={formValues.colorPageBg}
              fallback={DEFAULT_SITE_SETTINGS.colorPageBg}
              onChange={(hex) => handleFieldChange("colorPageBg", hex)}
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 rounded-[18px] bg-[var(--wsu-bg)] px-4 py-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--wsu-gray-mid)]">
            Clear any text field to hide it on the site. Colors fall back to defaults if blank.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--wsu-crimson)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save page and appearance"}
          </button>
        </div>
      </form>
    </section>
  );
}
