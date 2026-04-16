import { ManageBoard } from "@/components/ManageBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { listAppsOrdered } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const apps = await listAppsOrdered();

  return (
    <>
      <SiteHeader />
      <ManageBoard initialApps={apps} />
    </>
  );
}
