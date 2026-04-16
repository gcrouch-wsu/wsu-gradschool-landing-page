export function isSafeInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

export function normalizeInternalPath(
  value: string | string[] | undefined,
  fallback = "/manage",
): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return fallback;
  return isSafeInternalPath(candidate) ? candidate : fallback;
}
