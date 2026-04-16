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
      <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[var(--wsu-gray-light)] bg-white p-3 shadow-sm">
        <img
          src={logoUrl}
          alt={logoAlt || `${headerTitle} logo`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-16 min-w-[4.5rem] flex-col items-center justify-center rounded-2xl bg-[var(--wsu-crimson)] px-3 py-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white shadow-sm">
      <span>{brandLine1}</span>
      <span>{brandLine2}</span>
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
    <div className={`flex min-w-0 items-center gap-4 ${className}`.trim()}>
      <BrandMark
        brandLine1={brandLine1}
        brandLine2={brandLine2}
        headerTitle={headerTitle}
        logoUrl={logoUrl}
        logoAlt={logoAlt}
      />
      <div className="min-w-0">
        <div className="text-lg font-bold leading-tight text-[var(--wsu-gray)]">{headerTitle}</div>
        {headerSubtitle ? (
          <p className="mt-1 text-sm font-medium text-[var(--wsu-gray-mid)]">{headerSubtitle}</p>
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
