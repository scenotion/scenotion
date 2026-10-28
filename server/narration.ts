import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import {
  defaultTakeManifest,
  isNarrationLocale,
  isSafeId,
  normalizeTakePatch,
  type NarrationLocale,
  type NarrationScript,
  type TakeManifest,
  type VoiceTake,
  type VoiceTakePatch,
} from "../src/narration/model";

const ROUTE = "/__scenotion/narration";
const MAX_AUDIO_BYTES = 64 * 1024 * 1024;
const MAX_JSON_BYTES = 1024 * 1024;

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(body);
}

function sendError(response: ServerResponse, error: unknown): void {
  if (response.headersSent) return;
  if (error instanceof HttpError) {
    sendJson(response, error.status, { error: error.message });
    return;
  }
  console.error("[scenotion:narration]", error);
  sendJson(response, 500, { error: "Narration request failed." });
}

async function readBody(
  request: IncomingMessage,
  limit: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) {
      throw new HttpError(413, "Narration payload is too large.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const body = await readBody(request, MAX_JSON_BYTES);
  try {
    const parsed = JSON.parse(body.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("expected object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

function projectParam(value: string | null): string {
  if (!value || !isSafeId(value)) {
    throw new HttpError(400, "Invalid project id.");
  }
  return value;
}

function localeParam(value: string | null): NarrationLocale {
  if (!isNarrationLocale(value)) {
    throw new HttpError(400, "Invalid narration locale.");
  }
  return value;
}

function lineParam(value: string | null): string {
  if (!value || !isSafeId(value)) {
    throw new HttpError(400, "Invalid line id.");
  }
  return value;
}

const EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
};

function audioExtension(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  return EXTENSIONS[base] ?? "webm";
}

function contentRoot(): string {
  return path.join(process.cwd(), "content", "narration");
}

function voiceRoot(): string {
  return path.join(process.cwd(), "voiceover");
}

async function loadScript(project: string): Promise<NarrationScript> {
  const file = path.join(contentRoot(), project + ".json");
  let parsed: unknown;
  try {
    parsed = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    throw new HttpError(404, "No narration script for " + project + ".");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new HttpError(500, "Narration script is invalid.");
  }
  const script = parsed as NarrationScript;
  if (!Array.isArray(script.lines)) {
    throw new HttpError(500, "Narration script has no lines.");
  }
  return script;
}

function manifestPath(project: string, locale: NarrationLocale): string {
  return path.join(voiceRoot(), project, locale, "manifest.json");
}

async function loadManifest(
  project: string,
  locale: NarrationLocale,
): Promise<TakeManifest> {
  try {
    const parsed = JSON.parse(
      await fs.readFile(manifestPath(project, locale), "utf8"),
    ) as TakeManifest;
    if (!parsed || typeof parsed !== "object" || !parsed.lines) {
      return defaultTakeManifest(project, locale);
    }
    return parsed;
  } catch {
    return defaultTakeManifest(project, locale);
  }
}

async function saveManifest(manifest: TakeManifest): Promise<void> {
  const file = manifestPath(manifest.project, manifest.locale);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(manifest, null, 2), "utf8");
}

function lineTakes(manifest: TakeManifest, lineId: string): VoiceTake[] {
  return manifest.lines[lineId]?.takes ?? [];
}

function findTake(
  manifest: TakeManifest,
  lineId: string,
  takeId: string,
): VoiceTake | undefined {
  return lineTakes(manifest, lineId).find(take => take.id === takeId);
}

async function audioPath(
  project: string,
  locale: NarrationLocale,
  take: VoiceTake,
): Promise<string> {
  const root = path.join(voiceRoot(), project, locale);
  const file = path.join(root, take.file);
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new HttpError(400, "Invalid take file.");
  }
  return file;
}

async function handleManifest(
  url: URL,
  response: ServerResponse,
): Promise<void> {
  const project = projectParam(url.searchParams.get("project"));
  const locale = localeParam(url.searchParams.get("locale"));
  const script = await loadScript(project);
  const manifest = await loadManifest(project, locale);
  sendJson(response, 200, {
    project,
    locale,
    lines: script.lines,
    takes: manifest.lines,
  });
}

async function handleAudio(
  url: URL,
  response: ServerResponse,
): Promise<void> {
  const project = projectParam(url.searchParams.get("project"));
  const locale = localeParam(url.searchParams.get("locale"));
  const lineId = lineParam(url.searchParams.get("line"));
  const takeId = url.searchParams.get("take");
  if (!takeId) throw new HttpError(400, "Missing take id.");
  const manifest = await loadManifest(project, locale);
  const take = findTake(manifest, lineId, takeId);
  if (!take) throw new HttpError(404, "Take not found.");
  const file = await audioPath(project, locale, take);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(file);
  } catch {
    throw new HttpError(404, "Take file not found.");
  }
  response.statusCode = 200;
  response.setHeader("Content-Type", take.mimeType);
  response.setHeader("Content-Length", String(buffer.length));
  response.setHeader("Cache-Control", "no-store");
  response.end(buffer);
}

async function handleUpload(
  url: URL,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const project = projectParam(url.searchParams.get("project"));
  const locale = localeParam(url.searchParams.get("locale"));
  const lineId = lineParam(url.searchParams.get("line"));
  const duration = Number(url.searchParams.get("duration"));
  if (!Number.isFinite(duration) || duration <= 0 || duration > 3600) {
    throw new HttpError(400, "Invalid take duration.");
  }
  const script = await loadScript(project);
  if (!script.lines.some(line => line.id === lineId)) {
    throw new HttpError(404, "Narration line not found.");
  }
  const mimeType = request.headers["content-type"] ?? "audio/webm";
  const body = await readBody(request, MAX_AUDIO_BYTES);
  if (body.length === 0) throw new HttpError(400, "Empty audio payload.");
  const manifest = await loadManifest(project, locale);
  const id = "take-" + Date.now().toString(36) + "-" + randomBytes(3).toString("hex");
  const file = id + "." + audioExtension(mimeType);
  const directory = path.join(voiceRoot(), project, locale);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, file), body);
  const takes = lineTakes(manifest, lineId);
  const take: VoiceTake = {
    id,
    lineId,
    locale,
    file,
    mimeType,
    duration,
    size: body.length,
    createdAt: new Date().toISOString(),
    offset: 0,
    trimStart: 0,
    trimEnd: duration,
    gainDb: 0,
    fadeIn: 0,
    fadeOut: 0,
    active: takes.length === 0,
  };
  if (!manifest.lines[lineId]) manifest.lines[lineId] = { takes: [] };
  manifest.lines[lineId].takes.push(take);
  await saveManifest(manifest);
  sendJson(response, 201, { take });
}

async function handlePatch(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const body = await readJson(request);
  const project = projectParam(String(body.project ?? ""));
  const locale = localeParam(String(body.locale ?? ""));
  const lineId = lineParam(String(body.lineId ?? ""));
  const takeId = String(body.takeId ?? "");
  const manifest = await loadManifest(project, locale);
  const takes = lineTakes(manifest, lineId);
  const index = takes.findIndex(take => take.id === takeId);
  if (index < 0) throw new HttpError(404, "Take not found.");
  const patch: VoiceTakePatch = {};
  for (const key of [
    "offset",
    "trimStart",
    "trimEnd",
    "gainDb",
    "fadeIn",
    "fadeOut",
  ] as const) {
    if (body[key] !== undefined) patch[key] = Number(body[key]);
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  const updated = normalizeTakePatch(takes[index], patch);
  if (updated.active) {
    for (const take of takes) take.active = take.id === updated.id;
  }
  takes[index] = updated;
  manifest.lines[lineId].takes = takes;
  await saveManifest(manifest);
  sendJson(response, 200, { take: updated });
}

async function handleDelete(
  url: URL,
  response: ServerResponse,
): Promise<void> {
  const project = projectParam(url.searchParams.get("project"));
  const locale = localeParam(url.searchParams.get("locale"));
  const lineId = lineParam(url.searchParams.get("line"));
  const takeId = url.searchParams.get("take");
  if (!takeId) throw new HttpError(400, "Missing take id.");
  const manifest = await loadManifest(project, locale);
  const takes = lineTakes(manifest, lineId);
  const index = takes.findIndex(take => take.id === takeId);
  if (index < 0) throw new HttpError(404, "Take not found.");
  const [removed] = takes.splice(index, 1);
  if (removed.active && takes.length > 0) takes[0].active = true;
  manifest.lines[lineId].takes = takes;
  await saveManifest(manifest);
  try {
    await fs.rm(await audioPath(project, locale, removed), { force: true });
  } catch {
    // A missing file should not block metadata cleanup.
  }
  sendJson(response, 200, { deleted: removed.id });
}

async function handle(
  url: URL,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (url.pathname === ROUTE + "/manifest" && request.method === "GET") {
    return handleManifest(url, response);
  }
  if (url.pathname === ROUTE + "/audio" && request.method === "GET") {
    return handleAudio(url, response);
  }
  if (url.pathname === ROUTE + "/take" && request.method === "POST") {
    return handleUpload(url, request, response);
  }
  if (url.pathname === ROUTE + "/take" && request.method === "PATCH") {
    return handlePatch(request, response);
  }
  if (url.pathname === ROUTE + "/take" && request.method === "DELETE") {
    return handleDelete(url, response);
  }
  throw new HttpError(404, "Unknown narration endpoint.");
}

export function narrationPlugin(): Plugin {
  return {
    name: "scenotion:narration",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith(ROUTE)) return next();
        const url = new URL(request.url, "http://localhost");
        void handle(url, request, response).catch(error => {
          sendError(response, error);
        });
      });
    },
  };
}
