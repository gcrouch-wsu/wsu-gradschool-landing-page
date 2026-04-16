import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import { DEFAULT_SITE_SETTINGS } from "./site-defaults";
import { siteSettings, type SiteSettingsRow } from "./schema";

export { DEFAULT_SITE_SETTINGS } from "./site-defaults";

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow> => {
  try {
    const db = getDb();
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
    if (rows[0]) return rows[0];
  } catch {
    /* table missing or DB down */
  }
  return DEFAULT_SITE_SETTINGS;
});
