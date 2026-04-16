import { AppTile } from "@/components/AppTile";
import { SiteHeader } from "@/components/SiteHeader";
import { listAppsOrdered } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apps = await listAppsOrdered();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="mb-2 text-2xl font-bold text-[var(--wsu-gray)]">Applications</h2>
        <p className="mb-8 max-w-2xl text-sm text-[var(--wsu-gray-mid)]">
          This page is public. Editors sign in under Manage to add links, descriptions, and ordering.
        </p>
        {apps.length === 0 ? (
          <p className="rounded-[10px] border border-dashed border-[var(--wsu-gray-light)] bg-white py-12 text-center text-sm text-[var(--wsu-gray-mid)]">
            No applications yet. Sign in and open Manage to add cards.
          </p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <li key={app.id}>
                <AppTile app={app} href={app.url} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
