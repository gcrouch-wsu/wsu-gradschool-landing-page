import type { AppCard } from "@/lib/schema";

type TileProps = {
  app: AppCard;
  /** When set, the whole card is a link opening in a new tab */
  href?: string;
  className?: string;
};

export function AppTile({ app, href, className = "" }: TileProps) {
  const inner = (
    <>
      <div className="h-1 w-full rounded-t-[9px] bg-[var(--wsu-crimson)]" aria-hidden />
      <div className="p-4 pt-3">
        <h2 className="text-base font-bold text-[var(--wsu-gray)]">{app.title}</h2>
        <p className="mt-1 break-all text-xs font-medium text-[var(--wsu-crimson)]">{app.url}</p>
        {app.description ? (
          <p className="mt-2 text-sm leading-snug text-[var(--wsu-gray-mid)]">{app.description}</p>
        ) : null}
      </div>
    </>
  );

  const shell = `block rounded-[10px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition hover:shadow-md ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shell}>
        {inner}
      </a>
    );
  }

  return <div className={shell}>{inner}</div>;
}
