import { DbSetupHint } from "@/components/DbSetupHint";
import { ManageBoard } from "@/components/ManageBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { listAppsOrdered } from "@/lib/apps";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  let apps;
  try {
    apps = await listAppsOrdered();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return (
      <>
        <SiteHeader />
        <DbSetupHint message={message} />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <ManageBoard initialApps={apps} />
    </>
  );
}
