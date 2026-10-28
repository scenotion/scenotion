import { createSignal } from "@motion-canvas/core";

export const supportedLocales = ["en-US", "zh-CN"] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = "en-US";

const STORAGE_KEY = "scenotion.videoLocale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (supportedLocales as readonly string[]).includes(value);
}

export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.trim().replace(/_/g, "-").toLowerCase();
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-CN";
  if (normalized === "en" || normalized.startsWith("en-")) return "en-US";
  return null;
}

type ResolveLocaleOptions = {
  search?: string | null;
  stored?: string | null;
  fallback?: Locale;
};

export function resolveLocale({
  search = null,
  stored = null,
  fallback = defaultLocale,
}: ResolveLocaleOptions = {}): Locale {
  const params = new URLSearchParams(search?.startsWith("?") ? search : "?" + (search ?? ""));
  return (
    parseLocale(params.get("locale")) ??
    parseLocale(stored) ??
    fallback
  );
}

function readStoredLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  return resolveLocale({
    search: window.location.search,
    stored: readStoredLocale(),
  });
}

export const localeSignal = createSignal<Locale>(detectLocale());

if (typeof document !== "undefined") {
  document.documentElement.lang = localeSignal();
}

export function getLocale(): Locale {
  return localeSignal();
}

export function setLocale(next: Locale): void {
  localeSignal(next);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private or restricted contexts.
    }
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
}
