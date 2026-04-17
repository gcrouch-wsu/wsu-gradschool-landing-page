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
        className="w-full bg-[var(--wsu-card-accent)]"
        style={{ height: "var(--wsu-card-accent-height,6px)" }}
        aria-hidden
      />
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{
          padding: "var(--wsu-card-padding,20px)",
          paddingTop: "calc(var(--wsu-card-padding,20px) - 4px)",
          fontFamily: "var(--wsu-card-font-family,var(--font-montserrat),system-ui,sans-serif)",
        }}
      >
        <div>
          <h2
            className="font-bold leading-[1.2] text-[var(--wsu-card-title)]"
            style={{ fontSize: "var(--wsu-card-title-size,16px)" }}
          >
            {app.title}
          </h2>
          <p
            className="mt-2 overflow-hidden break-all font-semibold leading-5 text-[var(--wsu-url-on-card)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            style={{ fontSize: "var(--wsu-card-url-size,12px)" }}
          >
            {app.url}
          </p>
        </div>
        {app.description ? (
          <p
            className="mt-4 overflow-hidden leading-6 text-[var(--wsu-card-description)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
            style={{ fontSize: "var(--wsu-card-description-size,14px)" }}
          >
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

  const shell = `group flex h-full ${href ? "min-h-[15rem]" : "min-h-[11rem]"} flex-col overflow-hidden rounded-[length:var(--wsu-card-radius,10px)] border bg-[var(--wsu-card-bg,#fff)] transition duration-200 hover:-translate-y-0.5 hover:opacity-[0.99] ${className}`;

  const shellStyle = {
    boxShadow: "var(--wsu-card-shadow,0 4px 14px rgba(0,0,0,0.08))",
    borderColor: "var(--wsu-card-border,var(--wsu-gray-light))",
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shell} style={shellStyle}>
        {inner}
      </a>
    );
  }

  return (
    <div className={shell} style={shellStyle}>
      {inner}
    </div>
  );
}
