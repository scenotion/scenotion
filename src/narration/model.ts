export type NarrationLocale = "en-US" | "zh-CN";

export type NarrationLine = {
  id: string;
  scene: string;
  start: number;
  end: number;
  text: Partial<Record<NarrationLocale, string>>;
};

export type NarrationScript = {
  version: number;
  project: string;
  lines: NarrationLine[];
};

export type VoiceTake = {
  id: string;
  lineId: string;
  locale: NarrationLocale;
  file: string;
  mimeType: string;
  duration: number;
  size: number;
  createdAt: string;
  offset: number;
  trimStart: number;
  trimEnd: number;
  gainDb: number;
  fadeIn: number;
  fadeOut: number;
  active: boolean;
};

export type VoiceTakePatch = Partial<
  Pick<
    VoiceTake,
    "offset" | "trimStart" | "trimEnd" | "gainDb" | "fadeIn" | "fadeOut" | "active"
  >
>;

export type TakeLineState = {
  takes: VoiceTake[];
};

export type TakeManifest = {
  version: number;
  project: string;
  locale: NarrationLocale;
  lines: Record<string, TakeLineState>;
};

export function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "project";
}

export function isSafeId(value: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(value);
}

export function isNarrationLocale(value: unknown): value is NarrationLocale {
  return value === "en-US" || value === "zh-CN";
}

export function clampNumber(
  value: number,
  min: number,
  max: number,
  fallback: number = min,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function normalizeTakePatch(
  take: VoiceTake,
  patch: VoiceTakePatch,
): VoiceTake {
  const duration = Math.max(0, take.duration);
  const trimStart = clampNumber(
    patch.trimStart ?? take.trimStart,
    0,
    duration,
    0,
  );
  const trimEnd = clampNumber(
    patch.trimEnd ?? take.trimEnd,
    trimStart,
    duration,
    duration,
  );
  return {
    ...take,
    offset: clampNumber(patch.offset ?? take.offset, -60, 60, 0),
    trimStart,
    trimEnd,
    gainDb: clampNumber(patch.gainDb ?? take.gainDb, -60, 24, 0),
    fadeIn: clampNumber(
      patch.fadeIn ?? take.fadeIn,
      0,
      Math.max(0, trimEnd - trimStart),
      0,
    ),
    fadeOut: clampNumber(
      patch.fadeOut ?? take.fadeOut,
      0,
      Math.max(0, trimEnd - trimStart),
      0,
    ),
    active: patch.active ?? take.active,
  };
}

export function defaultTakeManifest(
  project: string,
  locale: NarrationLocale,
): TakeManifest {
  return { version: 1, project, locale, lines: {} };
}
