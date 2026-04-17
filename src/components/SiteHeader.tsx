import { cookies } from "next/headers";
import { SiteHeaderBar, type SiteHeaderAction } from "@/components/SiteHeaderBar";
import type { SiteSettingsRow } from "@/lib/schema";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

type Props = {
  settings: SiteSettingsRow;
};

export async function SiteHeader({ settings }: Props) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const signedIn = token ? await verifySessionToken(token) : false;
  const actions: SiteHeaderAction[] = [
    {
      kind: "link",
      href: signedIn ? "/manage" : "/login?next=/manage",
      label: "Manage apps",
      tone: "secondary",
    },
  ];

  if (signedIn) {
    actions.push({
      kind: "logout",
      label: "Sign out",
      tone: "primary",
    });
  }

  return <SiteHeaderBar settings={settings} actions={actions} />;
}
