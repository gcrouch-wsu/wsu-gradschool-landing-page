/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type BrandLockupProps = {
  brandLine1: string;
  brandLine2: string;
  headerTitle: string;
  headerSubtitle?: string | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
  href?: string;
  className?: string;
};

function BrandMark({
  brandLine1,
  brandLine2,
  headerTitle,
  logoUrl,
  logoAlt,
}: Omit<BrandLockupProps, "className" | "headerSubtitle" | "href">) {
  if (logoUrl) {
    return (
      <div className="flex min-w-0 max-w-[9rem] items-center sm:max-w-[10.5rem] lg:max-w-[12rem]">
        <img
          src={logoUrl}
          alt={logoAlt || `${headerTitle} logo`}
          className="block max-h-14 w-auto max-w-full object-contain sm:max-h-16"
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-stretch gap-3">
      <span className="w-1 shrink-0 rounded-full bg-[var(--wsu-crimson)]/85" aria-hidden />
      <div className="min-w-0 py-0.5">
        <p className="text-[0.62rem] font-bold uppercase leading-none tracking-[0.28em] text-[var(--wsu-crimson)]">
          {brandLine1}
        </p>
        <p className="mt-2 text-[0.62rem] font-bold uppercase leading-none tracking-[0.28em] text-[var(--wsu-gray-mid)]">
          {brandLine2}
        </p>
      </div>
    </div>
  );
}

export function BrandLockup({
  brandLine1,
  brandLine2,
  headerTitle,
  headerSubtitle,
  logoUrl,
  logoAlt,
  href,
  className = "",
}: BrandLockupProps) {
  const content = (
    <div
      className={`grid min-w-0 max-w-full gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-4 ${className}`.trim()}
    >
      <BrandMark
        brandLine1={brandLine1}
        brandLine2={brandLine2}
        headerTitle={headerTitle}
        logoUrl={logoUrl}
        logoAlt={logoAlt}
      />
      <div className="min-w-0 max-w-full">
        <div className="max-w-full text-lg font-bold leading-tight text-[var(--wsu-gray)] text-pretty">
          {headerTitle}
        </div>
        {headerSubtitle ? (
          <p className="mt-1 max-w-full text-sm font-medium text-[var(--wsu-gray-mid)] text-pretty">
            {headerSubtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="no-underline">
      {content}
    </Link>
  );
}
