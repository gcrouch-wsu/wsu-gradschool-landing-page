ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "logo_url" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "logo_alt" text;

ALTER TABLE "site_settings"
ALTER COLUMN "hero_lede" SET DEFAULT 'This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.';

ALTER TABLE "site_settings"
ALTER COLUMN "empty_state_text" SET DEFAULT 'No applications yet. Use Manage apps to add the first card.';

ALTER TABLE "site_settings"
ALTER COLUMN "manage_add_blurb" SET DEFAULT 'Add a title and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.';

ALTER TABLE "site_settings"
ALTER COLUMN "manage_order_blurb" SET DEFAULT 'Drag by the handle. The order here matches the public landing page.';

ALTER TABLE "site_settings"
ALTER COLUMN "login_title" SET DEFAULT 'Sign in to manage the directory';

ALTER TABLE "site_settings"
ALTER COLUMN "login_lede" SET DEFAULT 'Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.';

ALTER TABLE "site_settings"
ALTER COLUMN "login_back_label" SET DEFAULT 'Back to directory';

UPDATE "site_settings"
SET "hero_lede" = 'This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.'
WHERE "hero_lede" = 'This page is public. Editors sign in with Admin login to add links, descriptions, and ordering.';

UPDATE "site_settings"
SET "empty_state_text" = 'No applications yet. Use Manage apps to add the first card.'
WHERE "empty_state_text" = 'No applications yet. Sign in with Admin login to add cards.';

UPDATE "site_settings"
SET "manage_add_blurb" = 'Add a title and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.'
WHERE "manage_add_blurb" = 'Titles and URLs appear on the public page. Descriptions are optional. Drag cards in the frame below to set order; changes save automatically.';

UPDATE "site_settings"
SET "manage_order_blurb" = 'Drag by the handle. The order here matches the public landing page.'
WHERE "manage_order_blurb" = 'Drag by the handle. Order matches the public landing page.';

UPDATE "site_settings"
SET "login_title" = 'Sign in to manage the directory'
WHERE "login_title" = 'Admin sign in';

UPDATE "site_settings"
SET "login_lede" = 'Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.'
WHERE "login_lede" = 'Enter the shared admin password to manage application cards. The public directory is on the home page.';

UPDATE "site_settings"
SET "login_back_label" = 'Back to directory'
WHERE "login_back_label" = 'â† Back to directory';
