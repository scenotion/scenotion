import type {
  NarrationLine,
  NarrationLocale,
  TakeLineState,
  VoiceTake,
  VoiceTakePatch,
} from "../../src/narration/model";

const BASE = "/__scenotion/narration";

export type NarrationData = {
  project: string;
  locale: NarrationLocale;
  lines: NarrationLine[];
  takes: Record<string, TakeLineState>;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      message = parsed.error ?? text;
    } catch {
      // Keep the raw text.
    }
    throw new Error(message || "Narration request failed.");
  }
  return (await response.json()) as T;
}

function params(project: string, locale: NarrationLocale): URLSearchParams {
  return new URLSearchParams({ project, locale });
}

export async function fetchNarration(
  project: string,
  locale: NarrationLocale,
): Promise<NarrationData> {
  return readJson(await fetch(BASE + "/manifest?" + params(project, locale)));
}

export async function uploadTake({
  project,
  locale,
  lineId,
  duration,
  blob,
}: {
  project: string;
  locale: NarrationLocale;
  lineId: string;
  duration: number;
  blob: Blob;
}): Promise<VoiceTake> {
  const query = params(project, locale);
  query.set("line", lineId);
  query.set("duration", String(duration));
  const response = await fetch(BASE + "/take?" + query, {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob,
  });
  const result = await readJson<{ take: VoiceTake }>(response);
  return result.take;
}

export async function updateTake({
  project,
  locale,
  lineId,
  takeId,
  patch,
}: {
  project: string;
  locale: NarrationLocale;
  lineId: string;
  takeId: string;
  patch: VoiceTakePatch;
}): Promise<VoiceTake> {
  const response = await fetch(BASE + "/take", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, locale, lineId, takeId, ...patch }),
  });
  const result = await readJson<{ take: VoiceTake }>(response);
  return result.take;
}

export async function removeTake({
  project,
  locale,
  lineId,
  takeId,
}: {
  project: string;
  locale: NarrationLocale;
  lineId: string;
  takeId: string;
}): Promise<void> {
  const query = params(project, locale);
  query.set("line", lineId);
  query.set("take", takeId);
  const response = await fetch(BASE + "/take?" + query, { method: "DELETE" });
  await readJson<{ deleted: string }>(response);
}

export function audioUrl({
  project,
  locale,
  lineId,
  takeId,
}: {
  project: string;
  locale: NarrationLocale;
  lineId: string;
  takeId: string;
}): string {
  const query = params(project, locale);
  query.set("line", lineId);
  query.set("take", takeId);
  return BASE + "/audio?" + query;
}
