import { cookies } from "next/headers";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { BrandLockup } from "@/components/BrandLockup";
import type { SiteSettingsRow } from "@/lib/schema";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

type Props = {
  settings: SiteSettingsRow;
};

export async function SiteHeader({ settings }: Props) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const signedIn = token ? await verifySessionToken(token) : false;

  return (
    <>
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[var(--wsu-crimson)] from-[40%] to-[var(--wsu-gray-mid)] to-[40%]"
        aria-hidden
      />
      <header className="border-b border-[var(--wsu-gray-light)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <BrandLockup
            href="/"
            brandLine1={settings.brandLine1}
            brandLine2={settings.brandLine2}
            headerTitle={settings.headerTitle}
            headerSubtitle={settings.headerSubtitle}
            logoUrl={settings.logoUrl}
            logoAlt={settings.logoAlt}
          />

          <nav className="flex items-center gap-3">
            <Link
              href={signedIn ? "/manage" : "/login?next=/manage"}
              className="rounded-full border border-[var(--wsu-gray-light)] bg-white px-4 py-2 text-sm font-semibold text-[var(--wsu-gray)] transition hover:bg-[var(--wsu-bg)]"
            >
              Manage apps
            </Link>
            {signedIn ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-[var(--wsu-crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--wsu-crimson-dark)]"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
    </>
  );
}
