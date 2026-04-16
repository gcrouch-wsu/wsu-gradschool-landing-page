/** Shown when the database query fails (usually missing table or bad DATABASE_URL). */
export function DbSetupHint({ message }: { message: string }) {
  const isMissingTable =
    message.includes("app_card") ||
    message.includes("42P01") ||
    message.toLowerCase().includes("does not exist");

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-xl font-bold text-[var(--wsu-gray)]">Database not ready</h1>
      <p className="mt-2 text-sm text-[var(--wsu-gray-mid)]">
        The app could not load data from Postgres. Fix this once, then refresh this page.
      </p>
      {isMissingTable ? (
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-[var(--wsu-gray)]">
          <li>Open the Neon dashboard → <strong>SQL Editor</strong>.</li>
          <li>
            Run the SQL from the repo file <code className="rounded bg-[var(--wsu-gray-light)] px-1">drizzle/0000_init.sql</code>{" "}
            (creates the <code className="rounded bg-[var(--wsu-gray-light)] px-1">app_card</code> table).
          </li>
          <li>Confirm <code className="rounded bg-[var(--wsu-gray-light)] px-1">DATABASE_URL</code> in Vercel points at that same Neon project/branch.</li>
          <li>Redeploy or refresh.</li>
        </ol>
      ) : (
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--wsu-gray)]">
          <li>
            In Vercel → Settings → Environment Variables, confirm <code className="rounded bg-[var(--wsu-gray-light)] px-1">DATABASE_URL</code> exists for{" "}
            <strong>Production</strong> and matches Neon&apos;s connection string.
          </li>
          <li>Confirm <code className="rounded bg-[var(--wsu-gray-light)] px-1">SESSION_SECRET</code> is at least 32 characters.</li>
        </ul>
      )}
      <p className="mt-8 break-all rounded-lg bg-[var(--wsu-gray-light)]/40 p-3 font-mono text-xs text-[var(--wsu-gray)]">
        {message}
      </p>
    </main>
  );
}
