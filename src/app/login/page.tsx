import { LoginForm } from "@/components/LoginForm";
import { SiteHeaderBar, type SiteHeaderAction } from "@/components/SiteHeaderBar";
import { getSiteSettings } from "@/lib/settings";
import { normalizeInternalPath } from "@/lib/safe-path";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const settings = await getSiteSettings();
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = normalizeInternalPath(resolvedSearchParams.next);
  const headerActions: SiteHeaderAction[] = settings.loginBackLabel
    ? [{ kind: "link", href: "/", label: settings.loginBackLabel, tone: "secondary" }]
    : [];

  return (
    <>
      <SiteHeaderBar settings={settings} actions={headerActions} />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,420px)] lg:items-start">
          <section className="rounded-[24px] bg-[linear-gradient(135deg,rgba(152,30,50,0.08),rgba(57,57,57,0.04))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--wsu-crimson)]">
              Shared admin access
            </p>
            {settings.loginTitle ? (
              <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[var(--wsu-gray)]">
                {settings.loginTitle}
              </h1>
            ) : null}
            {settings.loginLede ? (
              <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[var(--wsu-gray-mid)]">
                {settings.loginLede}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] bg-white/80 p-4 ring-1 ring-black/5 backdrop-blur">
                <p className="text-sm font-semibold text-[var(--wsu-gray)]">One step</p>
                <p className="mt-1 text-sm text-[var(--wsu-gray-mid)]">
                  Sign-in only asks for the shared password.
                </p>
              </div>
              <div className="rounded-[18px] bg-white/80 p-4 ring-1 ring-black/5 backdrop-blur">
                <p className="text-sm font-semibold text-[var(--wsu-gray)]">After sign-in</p>
                <p className="mt-1 text-sm text-[var(--wsu-gray-mid)]">
                  You will go straight to the manage page.
                </p>
              </div>
              <div className="rounded-[18px] bg-white/80 p-4 ring-1 ring-black/5 backdrop-blur">
                <p className="text-sm font-semibold text-[var(--wsu-gray)]">What you can edit</p>
                <p className="mt-1 text-sm text-[var(--wsu-gray-mid)]">
                  Update cards, ordering, copy, colors, and the header logo.
                </p>
              </div>
            </div>

            {nextPath !== "/manage" ? (
              <p className="mt-6 text-sm text-[var(--wsu-gray-mid)]">
                After you sign in, you will return to <span className="font-semibold">{nextPath}</span>.
              </p>
            ) : null}
          </section>

          <LoginForm nextPath={nextPath} />
        </div>
      </main>
    </>
  );
}
