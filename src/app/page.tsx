import { AppTile } from "@/components/AppTile";
import { DbSetupHint } from "@/components/DbSetupHint";
import { SiteHeader } from "@/components/SiteHeader";
import { listAppsOrdered } from "@/lib/apps";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();

  let apps;
  try {
    apps = await listAppsOrdered();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return (
      <>
        <SiteHeader settings={settings} />
        <DbSetupHint message={message} />
      </>
    );
  }

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[28px] bg-white/72 px-6 py-8 shadow-[0_18px_45px_rgba(0,0,0,0.05)] ring-1 ring-black/5 backdrop-blur-sm sm:px-8">
          <h2 className="mb-2 text-2xl font-bold text-[var(--wsu-gray)]">{settings.heroTitle}</h2>
          <p className="mb-8 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[var(--wsu-gray-mid)]">
            {settings.heroLede}
          </p>
          {apps.length === 0 ? (
            <p className="rounded-[length:var(--wsu-card-radius,10px)] border border-dashed border-[var(--wsu-gray-light)] bg-white py-12 text-center text-sm text-[var(--wsu-gray-mid)]">
              {settings.emptyStateText}
            </p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
              {apps.map((app) => (
                <li key={app.id} className="h-full">
                  <AppTile app={app} href={app.url} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
