"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import { BrandLockup } from "@/components/BrandLockup";
import type { SiteSettingsRow } from "@/lib/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";

type Props = {
  settings: SiteSettingsRow;
  supportsLogoStorage: boolean;
};

function previewText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

export function SiteAppearanceForm({ settings, supportsLogoStorage }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [logoAlt, setLogoAlt] = useState(settings.logoAlt ?? "");
  const [brandLine1, setBrandLine1] = useState(settings.brandLine1);
  const [brandLine2, setBrandLine2] = useState(settings.brandLine2);
  const [headerTitle, setHeaderTitle] = useState(settings.headerTitle);
  const [headerSubtitle, setHeaderSubtitle] = useState(settings.headerSubtitle);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await updateSiteSettingsAction(fd);
      if (res.ok) {
        router.refresh();
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

  const previewTitle = previewText(headerTitle, DEFAULT_SITE_SETTINGS.headerTitle);
  const previewSubtitle = previewText(headerSubtitle, DEFAULT_SITE_SETTINGS.headerSubtitle);
  const previewBrandLine1 = previewText(brandLine1, DEFAULT_SITE_SETTINGS.brandLine1);
  const previewBrandLine2 = previewText(brandLine2, DEFAULT_SITE_SETTINGS.brandLine2);
  const previewLogoUrl = supportsLogoStorage ? logoUrl.trim() || null : null;
  const previewLogoAlt = previewText(logoAlt, `${previewTitle} logo`);

  return (
    <section className="mb-10 rounded-[18px] border border-[var(--wsu-gray-light)] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-[var(--wsu-gray)]">Page and appearance</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
            Update the public page, login screen, card styling, and header branding from one
            place.
          </p>
        </div>
        <div className="max-w-sm rounded-[18px] bg-[var(--wsu-bg)] px-4 py-3 text-sm leading-6 text-[var(--wsu-gray-mid)] ring-1 ring-black/5">
          Leave a field blank to fall back to the built-in default copy or colors.
          {supportsLogoStorage
            ? " Add a logo URL to replace the text mark in the upper-left header."
            : " The header currently uses the text mark because this database has not enabled logo storage yet."}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {banner ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{banner}</p> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,360px)]">
          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Logo and header</legend>

            {supportsLogoStorage ? (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                  Logo image URL <span className="font-normal normal-case">(optional)</span>
                  <input
                    name="logoUrl"
                    defaultValue={settings.logoUrl ?? ""}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    inputMode="url"
                    className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                    placeholder="https://example.edu/logo.svg or /logo.png"
                  />
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                  Logo alt text <span className="font-normal normal-case">(optional)</span>
                  <input
                    name="logoAlt"
                    defaultValue={settings.logoAlt ?? ""}
                    onChange={(e) => setLogoAlt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                    placeholder="Graduate School logo"
                  />
                </label>
              </>
            ) : (
              <>
                <input type="hidden" name="logoUrl" value="" />
                <input type="hidden" name="logoAlt" value="" />
                <div className="rounded-[16px] bg-[var(--wsu-bg)] px-4 py-3 text-sm leading-6 text-[var(--wsu-gray-mid)] ring-1 ring-black/5">
                  Logo storage is unavailable until the database migration adds the `logo_url` and
                  `logo_alt` columns. The rest of the page and appearance settings will still save
                  normally.
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Text mark line 1
                <input
                  name="brandLine1"
                  defaultValue={settings.brandLine1}
                  onChange={(e) => setBrandLine1(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                Text mark line 2
                <input
                  name="brandLine2"
                  defaultValue={settings.brandLine2}
                  onChange={(e) => setBrandLine2(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Site title
              <input
                name="headerTitle"
                defaultValue={settings.headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Site subtitle
              <input
                name="headerSubtitle"
                defaultValue={settings.headerSubtitle}
                onChange={(e) => setHeaderSubtitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
          </fieldset>

          <aside className="rounded-[18px] bg-[var(--wsu-bg)] p-5 ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--wsu-crimson)]">
              Header preview
            </p>
            <div className="mt-4 rounded-[18px] border border-[var(--wsu-gray-light)] bg-white p-4">
              <BrandLockup
                brandLine1={previewBrandLine1}
                brandLine2={previewBrandLine2}
                headerTitle={previewTitle}
                headerSubtitle={previewSubtitle}
                logoUrl={previewLogoUrl}
                logoAlt={previewLogoAlt}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--wsu-gray-mid)]">
              {supportsLogoStorage
                ? "Wide or tall logos scale naturally without a surrounding box. If you leave the logo URL blank, the header uses the text mark instead."
                : "The preview shows the text mark layout that will be used until logo storage is enabled in the database."}
            </p>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Public page</legend>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Section heading
              <input
                name="heroTitle"
                defaultValue={settings.heroTitle}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Intro paragraph
              <textarea
                name="heroLede"
                rows={4}
                defaultValue={settings.heroLede}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Empty state message
              <textarea
                name="emptyStateText"
                rows={3}
                defaultValue={settings.emptyStateText}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Login page</legend>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Page title
              <input
                name="loginTitle"
                defaultValue={settings.loginTitle}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Intro paragraph
              <textarea
                name="loginLede"
                rows={4}
                defaultValue={settings.loginLede}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Back link label
              <input
                name="loginBackLabel"
                defaultValue={settings.loginBackLabel}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
          </fieldset>
        </div>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Manage page</legend>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)] lg:col-span-2">
              Add application title
              <input
                name="manageAddTitle"
                defaultValue={settings.manageAddTitle}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)] lg:col-span-2">
              Add application blurb
              <textarea
                name="manageAddBlurb"
                rows={4}
                defaultValue={settings.manageAddBlurb}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Card order title
              <input
                name="manageOrderTitle"
                defaultValue={settings.manageOrderTitle}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Empty drag message
              <input
                name="manageEmptyDragText"
                defaultValue={settings.manageEmptyDragText}
                className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)] lg:col-span-2">
              Card order blurb
              <textarea
                name="manageOrderBlurb"
                rows={3}
                defaultValue={settings.manageOrderBlurb}
                className="mt-1 w-full resize-y rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Colors</legend>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(
              [
                ["colorPrimary", "Primary", settings.colorPrimary],
                ["colorPrimaryDark", "Primary hover", settings.colorPrimaryDark],
                ["colorText", "Main text", settings.colorText],
                ["colorTextMuted", "Muted text", settings.colorTextMuted],
                ["colorBorder", "Borders", settings.colorBorder],
                ["colorPageBg", "Page background", settings.colorPageBg],
                ["colorCardBg", "Card background", settings.colorCardBg],
                ["colorCardAccent", "Card top stripe", settings.colorCardAccent],
                ["colorUrlOnCard", "Card URL text", settings.colorUrlOnCard],
              ] as const
            ).map(([name, label, value]) => (
              <label
                key={name}
                className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
              >
                {label}
                <input
                  name={name}
                  type="text"
                  defaultValue={value}
                  className="mt-1 w-full rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 font-mono text-sm"
                  placeholder="#981e32"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-[18px] border border-[var(--wsu-gray-light)] p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--wsu-gray)]">Cards</legend>

          <div className="flex flex-wrap gap-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Corner radius (px)
              <input
                name="cardRadiusPx"
                type="number"
                min={4}
                max={32}
                defaultValue={settings.cardRadiusPx}
                className="mt-1 block w-32 rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
              Shadow
              <select
                name="cardShadow"
                defaultValue={settings.cardShadow}
                className="mt-1 block rounded-xl border border-[var(--wsu-gray-light)] px-3 py-2.5 text-sm"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 rounded-[18px] bg-[var(--wsu-bg)] px-4 py-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--wsu-gray-mid)]">
            Blank fields revert to the built-in default when you save.
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
