/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type BrandLockupProps = {
  brandLine1?: string | null;
  brandLine2?: string | null;
  headerTitle?: string | null;
  headerSubtitle?: string | null;
  headerTitleSizePx?: number | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoSizePx?: number | null;
  headerLayout?: string | null;
  contentAlign?: "start" | "center";
  href?: string;
  className?: string;
};

function BrandMark({
  brandLine1,
  brandLine2,
  headerTitle,
  logoUrl,
  logoAlt,
  logoSizePx,
}: Omit<BrandLockupProps, "className" | "headerSubtitle" | "href" | "headerLayout">) {
  if (logoUrl) {
    const size = logoSizePx ?? 160;
    return (
      <div
        className="flex min-w-0 items-center"
        style={{ maxWidth: `${size}px` }}
      >
        <img
          src={logoUrl}
          alt={logoAlt || (headerTitle?.trim() ? `${headerTitle} logo` : "Site logo")}
          className="block h-auto w-auto max-w-full object-contain"
          style={{ maxHeight: `${Math.round(size * 0.6)}px` }}
        />
      </div>
    );
  }

  const line1 = brandLine1?.trim();
  const line2 = brandLine2?.trim();

  if (!line1 && !line2) return null;

  return (
    <div className="flex min-w-0 items-stretch gap-3">
      <span className="w-1 shrink-0 rounded-full bg-[var(--wsu-crimson)]/85" aria-hidden />
      <div className="min-w-0 py-0.5">
        {line1 ? (
          <p className="text-[0.62rem] font-bold uppercase leading-none tracking-[0.28em] text-[var(--wsu-crimson)]">
            {line1}
          </p>
        ) : null}
        {line2 ? (
          <p className="text-[0.62rem] font-bold uppercase leading-none tracking-[0.28em] text-[var(--wsu-gray-mid)]">
            {line2}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function BrandLockup({
  brandLine1,
  brandLine2,
  headerTitle,
  headerSubtitle,
  headerTitleSizePx,
  logoUrl,
  logoAlt,
  logoSizePx,
  contentAlign = "start",
  headerLayout = "side",
  href,
  className = "",
}: BrandLockupProps) {
  const hasMark = Boolean(logoUrl || brandLine1?.trim() || brandLine2?.trim());
  const hasTitle = Boolean(headerTitle?.trim());
  const hasSubtitle = Boolean(headerSubtitle?.trim());
  const isCentered = contentAlign === "center";

  if (!hasMark && !hasTitle && !hasSubtitle) {
    return null;
  }

  const isStacked = headerLayout === "stacked";

  const content = (
    <div
      className={`grid min-w-0 max-w-full gap-3 ${
        hasMark && (hasTitle || hasSubtitle)
          ? isStacked
            ? "grid-cols-1 items-start"
            : "sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-4"
          : ""
      } ${isCentered ? "justify-items-center text-center" : ""} ${className}`.trim()}
    >
      {hasMark ? (
        <BrandMark
          brandLine1={brandLine1}
          brandLine2={brandLine2}
          headerTitle={headerTitle}
          logoUrl={logoUrl}
          logoAlt={logoAlt}
          logoSizePx={logoSizePx}
        />
      ) : null}
      {hasTitle || hasSubtitle ? (
        <div className={`min-w-0 max-w-full ${isCentered ? "text-center" : ""}`.trim()}>
          {hasTitle ? (
            <div
              className="max-w-full font-bold leading-[1.08] text-[var(--wsu-gray)] text-pretty"
              style={{
                fontSize: `${Math.min(48, Math.max(18, headerTitleSizePx ?? 28))}px`,
              }}
            >
              {headerTitle}
            </div>
          ) : null}
          {hasSubtitle ? (
            <p
              className={`max-w-full text-sm font-medium text-[var(--wsu-gray-mid)] text-pretty ${
                hasTitle ? "mt-1" : ""
              }`.trim()}
            >
              {headerSubtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="no-underline">
      {content}
    </Link>
  );
}
