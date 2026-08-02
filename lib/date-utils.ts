/**
 * Deterministic date formatting utilities.
 *
 * Rules:
 * - Always pin the timezone to UTC so server and client render identical strings,
 *   regardless of where the server or the visitor's browser is physically located.
 * - Never call `new Date()` (i.e. "now") during render. Timestamps must be passed
 *   in as static ISO strings/numbers from data, not generated at render time.
 * - Locale is always explicit and comes from app state, never `navigator.language`.
 */

export type SupportedLocale = "it" | "en" | "ja";

const LOCALE_MAP: Record<SupportedLocale, string> = {
  it: "it-IT",
  en: "en-US",
  ja: "ja-JP",
};

function toDate(input: string | number | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

/** Formats a date as "12 Jul 2026" style, fixed to UTC. */
export function formatDate(
  input: string | number | Date,
  locale: SupportedLocale = "en"
): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(toDate(input));
}

/** Formats a date + time, fixed to UTC. */
export function formatDateTime(
  input: string | number | Date,
  locale: SupportedLocale = "en"
): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(toDate(input));
}

/**
 * Deterministic "time ago" style relative label. This is computed from two
 * fixed timestamps (never from "now"), so it is safe during SSR/hydration.
 */
export function formatRelativeFromFixedPoint(
  input: string | number | Date,
  referencePoint: string | number | Date,
  locale: SupportedLocale = "en"
): string {
  const date = toDate(input).getTime();
  const reference = toDate(referencePoint).getTime();
  const diffMs = reference - date;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(LOCALE_MAP[locale], {
    numeric: "auto",
  });

  if (Math.abs(diffMinutes) < 60) return rtf.format(-diffMinutes, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(-diffHours, "hour");
  return rtf.format(-diffDays, "day");
}
