"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { BrandLockup } from "@/components/BrandLockup";
import type { SiteSettingsRow } from "@/lib/schema";

export type HeaderDisplaySettings = Pick<
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
>;

export type SiteHeaderAction =
  | {
      kind: "link";
      href: string;
      label: string;
      tone?: "primary" | "secondary";
    }
  | {
      kind: "logout";
      label: string;
      tone?: "primary" | "secondary";
    };

type Props = {
  settings: HeaderDisplaySettings;
  actions?: SiteHeaderAction[];
};

function actionClass(tone: SiteHeaderAction["tone"] = "secondary") {
  return tone === "primary"
    ? "rounded-full bg-[var(--wsu-crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--wsu-crimson-dark)]"
    : "rounded-full border border-[var(--wsu-gray-light)] bg-white px-4 py-2 text-sm font-semibold text-[var(--wsu-gray)] transition hover:bg-[var(--wsu-bg)]";
}

function HeaderActions({ actions, centered = false }: { actions: SiteHeaderAction[]; centered?: boolean }) {
  if (actions.length === 0) return null;

  return (
    <nav className={`flex flex-wrap items-center gap-3 ${centered ? "justify-center" : ""}`.trim()}>
      {actions.map((action) =>
        action.kind === "logout" ? (
          <form action={logoutAction} key={`logout-${action.label}`}>
            <button type="submit" className={actionClass(action.tone)}>
              {action.label}
            </button>
          </form>
        ) : (
          <Link key={`${action.href}-${action.label}`} href={action.href} className={actionClass(action.tone)}>
            {action.label}
          </Link>
        ),
      )}
    </nav>
  );
}

export function SiteHeaderBar({ settings, actions = [] }: Props) {
  const placement = settings.headerPlacement ?? "split";
  const centered = placement === "centered";

  const lockup = (
    <BrandLockup
      href="/"
      className={placement === "split" ? "w-full max-w-[42rem]" : "w-full"}
      brandLine1={settings.brandLine1}
      brandLine2={settings.brandLine2}
      headerTitle={settings.headerTitle}
      headerSubtitle={settings.headerSubtitle}
      headerTitleSizePx={settings.headerTitleSizePx}
      headerTextPaddingTopPx={settings.headerTextPaddingTopPx}
      headerTextPaddingBottomPx={settings.headerTextPaddingBottomPx}
      headerTitleSubtitleGapPx={settings.headerTitleSubtitleGapPx}
      logoUrl={settings.logoUrl}
      logoAlt={settings.logoAlt}
      logoSizePx={settings.logoSizePx}
      headerLayout={settings.headerLayout}
      contentAlign={centered ? "center" : "start"}
    />
  );

  const actionsNode = <HeaderActions actions={actions} centered={centered} />;

  return (
    <>
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[var(--wsu-crimson)] from-[40%] to-[var(--wsu-gray-mid)] to-[40%]"
        aria-hidden
      />
      <header className="border-b border-[var(--wsu-gray-light)] bg-white">
        {placement === "stacked" ? (
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4">
            {lockup}
            {actions.length ? <div className="flex w-full justify-end">{actionsNode}</div> : null}
          </div>
        ) : placement === "centered" ? (
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-5 text-center">
            {lockup}
            {actionsNode}
          </div>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            {lockup}
            {actionsNode}
          </div>
        )}
      </header>
    </>
  );
}
