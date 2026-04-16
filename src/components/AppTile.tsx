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
      <div
        className="h-1.5 w-full bg-[var(--wsu-card-accent)]"
        aria-hidden
      />
      <div className="flex min-h-0 flex-1 flex-col p-5 pt-4">
        <div>
          <h2 className="text-base font-bold leading-6 text-[var(--wsu-gray)]">{app.title}</h2>
          <p className="mt-2 overflow-hidden break-all text-xs font-semibold leading-5 text-[var(--wsu-url-on-card)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {app.url}
          </p>
        </div>
        {app.description ? (
          <p className="mt-4 overflow-hidden text-sm leading-6 text-[var(--wsu-gray-mid)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
            {app.description}
          </p>
        ) : null}
        {href ? (
          <div className="mt-auto pt-5 text-sm font-semibold text-[var(--wsu-crimson)] transition group-hover:text-[var(--wsu-crimson-dark)]">
            Open tool
          </div>
        ) : null}
      </div>
    </>
  );

  const shell = `group flex h-full ${href ? "min-h-[15rem]" : "min-h-[11rem]"} flex-col overflow-hidden rounded-[length:var(--wsu-card-radius,10px)] bg-[var(--wsu-card-bg,#fff)] ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:opacity-[0.99] ${className}`;

  const shadowStyle = { boxShadow: "var(--wsu-card-shadow,0 4px 14px rgba(0,0,0,0.08))" };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shell} style={shadowStyle}>
        {inner}
      </a>
    );
  }

  return (
    <div className={shell} style={shadowStyle}>
      {inner}
    </div>
  );
}
