"use client";

import type { SiteSettingsRow } from "@/lib/schema";
import { buildSiteThemeCss } from "@/lib/site-theme-css";

export function LiveSiteTheme({ settings }: { settings: SiteSettingsRow }) {
  return <style dangerouslySetInnerHTML={{ __html: buildSiteThemeCss(settings) }} />;
}
