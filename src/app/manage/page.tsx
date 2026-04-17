import { DbSetupHint } from "@/components/DbSetupHint";
import { ManageBoard } from "@/components/ManageBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { listAppsOrdered } from "@/lib/apps";
import {
  getSiteSettings,
  siteSettingsSupportLogoColumns,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const settings = await getSiteSettings();
  const supportsLogoStorage = await siteSettingsSupportLogoColumns();

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
      <ManageBoard
        initialApps={apps}
        settings={settings}
        supportsLogoStorage={supportsLogoStorage}
      />
    </>
  );
}
