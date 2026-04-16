# App landing page

## Purpose

Directory of internal tools for Washington State University Graduate School. **Visitors** open the deployment URL and see a public grid of application cards (title, URL, optional description). **Editors** sign in at `/login`, then use **`/manage`** to add, remove, and drag-reorder cards. Data is stored in **Postgres** (shared for everyone who visits the site).

Remote: [gcrouch-wsu/App-landing-page](https://github.com/gcrouch-wsu/App-landing-page)

## Stack

| Item | Role |
|------|------|
| Next.js (App Router) | UI, server actions, middleware |
| Neon / Vercel Postgres | `DATABASE_URL`, table `app_card` |
| Signed cookie session | `SESSION_SECRET` + `ADMIN_PASSWORD` for `/login` → `/manage` |

The previous single-file `index.html` prototype lives in `legacy/index.html` for reference.

## Routes

| Path | Access |
|------|--------|
| `/` | Public — read-only cards, links open in a new tab |
| `/login` | Public — admin password form |
| `/manage` | Requires valid session cookie (set after successful login) |

Your **public URL** is the Vercel production hostname (or custom domain), e.g. `https://your-project.vercel.app/`.

## Local development

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` (at least 32 characters).

2. Create the table (once). Either run `drizzle/0000_init.sql` in the Neon SQL editor, or from the project root:

   ```bash
   npm run db:push
   ```

3. Start the app:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`, go to **Admin login**, sign in, then **Manage**.

## Deploying on Vercel

1. Import the GitHub repo in Vercel (framework **Next.js** is auto-detected).
2. Add a Neon (or Vercel Postgres) database and set **`DATABASE_URL`** in the project environment.
3. Set **`ADMIN_PASSWORD`** (long random string) and **`SESSION_SECRET`** (≥ 32 random characters).
4. Run the SQL in `drizzle/0000_init.sql` once against that database (or run `npm run db:push` locally pointed at the same `DATABASE_URL`).
5. Deploy. The public directory is `/`; editors use `/login` then `/manage`.

Optional: **Deployment Protection** on Vercel if you want the whole site gated; otherwise only `/manage` is login-protected.

## Security note

Admin auth is a **shared password** plus an **httpOnly** session cookie. It is appropriate for a small trusted editor group. For SSO, audit logs, or per-user roles, replace this with **Clerk**, **Auth0**, or similar and keep the same Postgres-backed card model.

## Possible next steps

- Swap password login for Clerk or WSU SSO.
- Per-card accent color (column + color picker), matching the old static prototype.
- Rate-limit `/login` and rotate `SESSION_SECRET` if a cookie leak is a concern.
