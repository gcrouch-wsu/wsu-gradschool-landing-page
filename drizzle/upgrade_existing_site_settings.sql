ALTER TABLE "app_card"
ADD COLUMN IF NOT EXISTS "action_label" text;

UPDATE "app_card"
SET "action_label" = 'Open tool'
WHERE "action_label" IS NULL
   OR btrim("action_label") = '';

ALTER TABLE "app_card"
ALTER COLUMN "action_label" SET DEFAULT 'Open tool';

ALTER TABLE "app_card"
ALTER COLUMN "action_label" SET NOT NULL;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "logo_url" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "logo_alt" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_title_size_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_text_padding_top_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_text_padding_bottom_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_text_padding_left_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_text_padding_right_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_title_subtitle_gap_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "logo_size_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_layout" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "header_placement" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "color_card_border" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "color_card_title" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "color_card_description" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_font_family" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_action_font_family" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_action_font_weight" text;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_title_size_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_url_size_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_description_size_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_padding_px" integer;

ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "card_accent_height_px" integer;

ALTER TABLE "site_settings"
ALTER COLUMN "brand_line1" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "brand_line2" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_title" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_subtitle" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "hero_title" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "hero_lede" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "empty_state_text" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "manage_add_title" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "manage_add_blurb" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "manage_order_title" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "manage_order_blurb" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "manage_empty_drag_text" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "login_title" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "login_lede" DROP NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "login_back_label" DROP NOT NULL;

INSERT INTO "site_settings" (
  "id",
  "logo_url",
  "logo_alt",
  "logo_size_px",
  "header_layout",
  "brand_line1",
  "brand_line2",
  "header_title",
  "header_subtitle",
  "header_title_size_px",
  "header_text_padding_top_px",
  "header_text_padding_bottom_px",
  "header_text_padding_left_px",
  "header_text_padding_right_px",
  "header_title_subtitle_gap_px",
  "hero_title",
  "hero_lede",
  "empty_state_text",
  "manage_add_title",
  "manage_add_blurb",
  "manage_order_title",
  "manage_order_blurb",
  "manage_empty_drag_text",
  "login_title",
  "login_lede",
  "login_back_label",
  "color_primary",
  "color_primary_dark",
  "color_text",
  "color_text_muted",
  "color_border",
  "color_page_bg",
  "color_card_bg",
  "color_card_border",
  "color_card_accent",
  "color_card_title",
  "color_card_description",
  "color_url_on_card",
  "card_font_family",
  "card_action_font_family",
  "card_action_font_weight",
  "card_title_size_px",
  "card_url_size_px",
  "card_description_size_px",
  "card_padding_px",
  "card_accent_height_px",
  "card_radius_px",
  "card_shadow"
) VALUES (
  1,
  NULL,
  NULL,
  160,
  'side',
  'WSU',
  'Grad',
  'Graduate School Tools',
  'Internal directory',
  28,
  0,
  0,
  0,
  0,
  4,
  'Applications',
  'This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.',
  'No applications yet. Use Manage apps to add the first card.',
  'Add application',
  'Add a title, action label, and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.',
  'Card order and styling',
  'Drag by the handle. The order here matches the public landing page.',
  'No cards yet. Add one above.',
  'Sign in to manage the directory',
  'Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.',
  'Back to directory',
  '#981e32',
  '#6d1524',
  '#393939',
  '#5e6a71',
  '#e2e2e2',
  '#f7f5f5',
  '#ffffff',
  '#e2e2e2',
  '#981e32',
  '#393939',
  '#5e6a71',
  '#981e32',
  'montserrat',
  'match-card',
  '700',
  16,
  12,
  14,
  20,
  6,
  10,
  'md'
)
ON CONFLICT ("id") DO NOTHING;

UPDATE "site_settings"
SET "header_title_size_px" = 28
WHERE "header_title_size_px" IS NULL;

UPDATE "site_settings"
SET "header_text_padding_top_px" = 0
WHERE "header_text_padding_top_px" IS NULL;

UPDATE "site_settings"
SET "header_text_padding_bottom_px" = 0
WHERE "header_text_padding_bottom_px" IS NULL;

UPDATE "site_settings"
SET "header_text_padding_left_px" = 0
WHERE "header_text_padding_left_px" IS NULL;

UPDATE "site_settings"
SET "header_text_padding_right_px" = 0
WHERE "header_text_padding_right_px" IS NULL;

UPDATE "site_settings"
SET "header_title_subtitle_gap_px" = 4
WHERE "header_title_subtitle_gap_px" IS NULL;

UPDATE "site_settings"
SET "logo_size_px" = 160
WHERE "logo_size_px" IS NULL;

UPDATE "site_settings"
SET "header_layout" = 'side'
WHERE "header_layout" IS NULL;

UPDATE "site_settings"
SET "header_placement" = 'split'
WHERE "header_placement" IS NULL;

UPDATE "site_settings"
SET "color_card_border" = '#e2e2e2'
WHERE "color_card_border" IS NULL;

UPDATE "site_settings"
SET "color_card_title" = '#393939'
WHERE "color_card_title" IS NULL;

UPDATE "site_settings"
SET "color_card_description" = '#5e6a71'
WHERE "color_card_description" IS NULL;

UPDATE "site_settings"
SET "card_font_family" = 'montserrat'
WHERE "card_font_family" IS NULL;

UPDATE "site_settings"
SET "card_action_font_family" = 'match-card'
WHERE "card_action_font_family" IS NULL;

UPDATE "site_settings"
SET "card_action_font_weight" = '700'
WHERE "card_action_font_weight" IS NULL;

UPDATE "site_settings"
SET "card_title_size_px" = 16
WHERE "card_title_size_px" IS NULL;

UPDATE "site_settings"
SET "card_url_size_px" = 12
WHERE "card_url_size_px" IS NULL;

UPDATE "site_settings"
SET "card_description_size_px" = 14
WHERE "card_description_size_px" IS NULL;

UPDATE "site_settings"
SET "card_padding_px" = 20
WHERE "card_padding_px" IS NULL;

UPDATE "site_settings"
SET "card_accent_height_px" = 6
WHERE "card_accent_height_px" IS NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "hero_lede" SET DEFAULT 'This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.';

ALTER TABLE "site_settings"
ALTER COLUMN "empty_state_text" SET DEFAULT 'No applications yet. Use Manage apps to add the first card.';

ALTER TABLE "site_settings"
ALTER COLUMN "manage_add_blurb" SET DEFAULT 'Add a title, action label, and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.';

ALTER TABLE "site_settings"
ALTER COLUMN "manage_order_blurb" SET DEFAULT 'Drag by the handle. The order here matches the public landing page.';

ALTER TABLE "site_settings"
ALTER COLUMN "login_title" SET DEFAULT 'Sign in to manage the directory';

ALTER TABLE "site_settings"
ALTER COLUMN "login_lede" SET DEFAULT 'Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.';

ALTER TABLE "site_settings"
ALTER COLUMN "login_back_label" SET DEFAULT 'Back to directory';

ALTER TABLE "site_settings"
ALTER COLUMN "header_title_size_px" SET DEFAULT 28;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_top_px" SET DEFAULT 0;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_top_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_bottom_px" SET DEFAULT 0;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_bottom_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_left_px" SET DEFAULT 0;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_left_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_right_px" SET DEFAULT 0;

ALTER TABLE "site_settings"
ALTER COLUMN "header_text_padding_right_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_title_subtitle_gap_px" SET DEFAULT 4;

ALTER TABLE "site_settings"
ALTER COLUMN "header_title_subtitle_gap_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "logo_size_px" SET DEFAULT 160;

ALTER TABLE "site_settings"
ALTER COLUMN "logo_size_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_layout" SET DEFAULT 'side';

ALTER TABLE "site_settings"
ALTER COLUMN "header_layout" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "header_placement" SET DEFAULT 'split';

ALTER TABLE "site_settings"
ALTER COLUMN "header_placement" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_border" SET DEFAULT '#e2e2e2';

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_border" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_title" SET DEFAULT '#393939';

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_title" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_description" SET DEFAULT '#5e6a71';

ALTER TABLE "site_settings"
ALTER COLUMN "color_card_description" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_font_family" SET DEFAULT 'montserrat';

ALTER TABLE "site_settings"
ALTER COLUMN "card_font_family" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_action_font_family" SET DEFAULT 'match-card';

ALTER TABLE "site_settings"
ALTER COLUMN "card_action_font_family" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_action_font_weight" SET DEFAULT '700';

ALTER TABLE "site_settings"
ALTER COLUMN "card_action_font_weight" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_title_size_px" SET DEFAULT 16;

ALTER TABLE "site_settings"
ALTER COLUMN "card_title_size_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_url_size_px" SET DEFAULT 12;

ALTER TABLE "site_settings"
ALTER COLUMN "card_url_size_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_description_size_px" SET DEFAULT 14;

ALTER TABLE "site_settings"
ALTER COLUMN "card_description_size_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_padding_px" SET DEFAULT 20;

ALTER TABLE "site_settings"
ALTER COLUMN "card_padding_px" SET NOT NULL;

ALTER TABLE "site_settings"
ALTER COLUMN "card_accent_height_px" SET DEFAULT 6;

ALTER TABLE "site_settings"
ALTER COLUMN "card_accent_height_px" SET NOT NULL;

UPDATE "site_settings"
SET "hero_lede" = 'This directory is public. Use Manage apps to sign in and update links, descriptions, ordering, and branding.'
WHERE "hero_lede" = 'This page is public. Editors sign in with Admin login to add links, descriptions, and ordering.';

UPDATE "site_settings"
SET "empty_state_text" = 'No applications yet. Use Manage apps to add the first card.'
WHERE "empty_state_text" = 'No applications yet. Sign in with Admin login to add cards.';

UPDATE "site_settings"
SET "manage_add_blurb" = 'Add a title, action label, and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.'
WHERE "manage_add_blurb" IN (
  'Titles and URLs appear on the public page. Descriptions are optional. Drag cards in the frame below to set order; changes save automatically.',
  'Add a title and URL for each application. Descriptions and branding are optional. Reorder cards below and changes save automatically.'
);

UPDATE "site_settings"
SET "manage_order_blurb" = 'Drag by the handle. The order here matches the public landing page.'
WHERE "manage_order_blurb" = 'Drag by the handle. Order matches the public landing page.';

UPDATE "site_settings"
SET "manage_order_title" = 'Card order and styling'
WHERE "manage_order_title" = 'Card order';

UPDATE "site_settings"
SET "login_title" = 'Sign in to manage the directory'
WHERE "login_title" = 'Admin sign in';

UPDATE "site_settings"
SET "login_lede" = 'Use the shared admin password to edit cards, update branding, and manage the header logo. You will land on the manage page after you sign in.'
WHERE "login_lede" = 'Enter the shared admin password to manage application cards. The public directory is on the home page.';

UPDATE "site_settings"
SET "login_back_label" = 'Back to directory'
WHERE "login_back_label" <> 'Back to directory'
  AND "login_back_label" IS NOT NULL;
