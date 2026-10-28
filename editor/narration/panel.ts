import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Pane, Select, useApplication } from "@motion-canvas/ui";
import {
  slugify,
  type NarrationLocale,
  type VoiceTake,
  type VoiceTakePatch,
} from "../../src/narration/model";
import { getEditorLocale, getVideoLocale } from "../i18n";
import {
  audioUrl,
  fetchNarration,
  removeTake,
  updateTake,
  uploadTake,
  type NarrationData,
} from "./api";
import { VoiceRecorder } from "./recorder";
import { Waveform } from "./Waveform";

const create = h as any;

const localeOptions = [
  { value: "en-US", text: "English" },
  { value: "zh-CN", text: "简体中文" },
] as const;

type Draft = Pick<
  VoiceTake,
  | "offset"
  | "trimStart"
  | "trimEnd"
  | "gainDb"
  | "fadeIn"
  | "fadeOut"
>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function numberOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function NumberField({
  label,
  value,
  step,
  onInput,
}: {
  label: string;
  value: number;
  step: number;
  onInput: (value: number) => void;
}) {
  return create(
    "label",
    { className: "narration-field" },
    create("span", null, label),
    create("input", {
      type: "number",
      value: String(Number(value.toFixed(3))),
      step,
      onInput: (event: any) => onInput(Number(event.currentTarget.value)),
    }),
  );
}

export function NarrationPane({ tab }: { tab: string }) {
  const { project } = useApplication();
  const zh = getEditorLocale() === "zh-CN";
  const projectSlug = slugify(project.name);
  const [locale, setLocale] = useState<NarrationLocale>(getVideoLocale());
  const [data, setData] = useState<NarrationData | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedTakeId, setSelectedTakeId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VoiceTake | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const load = useCallback(
    async (preferredLine?: string) => {
      setLoading(true);
      setError("");
      try {
        const next = await fetchNarration(projectSlug, locale);
        setData(next);
        setSelectedLineId(current => {
          if (current && next.lines.some(line => line.id === current)) {
            return current;
          }
          if (preferredLine && next.lines.some(line => line.id === preferredLine)) {
            return preferredLine;
          }
          return next.lines[0]?.id ?? null;
        });
      } catch (err) {
        setData(null);
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [projectSlug, locale],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      stopTimer();
      audioRef.current?.pause();
    },
    [],
  );

  const selectedLine = data?.lines.find(line => line.id === selectedLineId) ?? null;
  const takes = selectedLine
    ? data?.takes[selectedLine.id]?.takes ?? []
    : [];
  const selectedTake =
    takes.find(take => take.id === selectedTakeId) ??
    takes.find(take => take.active) ??
    takes[0] ??
    null;

  useEffect(() => {
    const next = takes.find(take => take.active) ?? takes[0] ?? null;
    setSelectedTakeId(next?.id ?? null);
    setDraft(next ? { ...next } : null);
    // takes is derived from data and selectedLineId.
  }, [data, selectedLineId]);

  const selectTake = (take: VoiceTake) => {
    setSelectedTakeId(take.id);
    setDraft({ ...take });
  };

  const startRecording = async () => {
    if (!selectedLine || recording) return;
    setError("");
    setStatus("");
    const recorder = new VoiceRecorder();
    try {
      await recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      stopTimer();
      timerRef.current = window.setInterval(() => {
        setElapsed(value => value + 0.1);
      }, 100);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || !selectedLine) return;
    setBusy(true);
    stopTimer();
    try {
      const result = await recorder.stop();
      recorderRef.current = null;
      setRecording(false);
      const take = await uploadTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        duration: result.duration,
        blob: result.blob,
      });
      setStatus(
        zh
          ? "已保存 " + take.duration.toFixed(1) + " 秒。"
          : "Saved " + take.duration.toFixed(1) + "s.",
      );
      await load(selectedLine.id);
      setSelectedTakeId(take.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const playTake = async (take: VoiceTake) => {
    if (!selectedLine) return;
    if (playing === take.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = audioUrl({
      project: projectSlug,
      locale,
      lineId: selectedLine.id,
      takeId: take.id,
    });
    audio.onended = () => setPlaying(null);
    try {
      await audio.play();
      setPlaying(take.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saveDraft = async () => {
    if (!selectedLine || !selectedTake || !draft) return;
    setBusy(true);
    setError("");
    try {
      const patch: VoiceTakePatch = {
        offset: numberOr(draft.offset, 0),
        trimStart: numberOr(draft.trimStart, 0),
        trimEnd: numberOr(draft.trimEnd, selectedTake.duration),
        gainDb: numberOr(draft.gainDb, 0),
        fadeIn: numberOr(draft.fadeIn, 0),
        fadeOut: numberOr(draft.fadeOut, 0),
      };
      await updateTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        takeId: selectedTake.id,
        patch,
      });
      setStatus(zh ? "已更新 take 属性。" : "Take properties updated.");
      await load(selectedLine.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const activateTake = async () => {
    if (!selectedLine || !selectedTake) return;
    setBusy(true);
    setError("");
    try {
      await updateTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        takeId: selectedTake.id,
        patch: { active: true },
      });
      setStatus(zh ? "已设为当前 take。" : "Active take updated.");
      await load(selectedLine.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteTake = async () => {
    if (!selectedLine || !selectedTake) return;
    if (!window.confirm(zh ? "删除这个 take？" : "Delete this take?")) return;
    setBusy(true);
    setError("");
    try {
      await removeTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        takeId: selectedTake.id,
      });
      setStatus(zh ? "已删除 take。" : "Take deleted.");
      await load(selectedLine.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const lineList = data
    ? create(
        "div",
        { className: "narration-lines" },
        data.lines.map(line => {
          const lineTakes = data.takes[line.id]?.takes ?? [];
          return create(
            "button",
            {
              key: line.id,
              className:
                "narration-line" +
                (line.id === selectedLineId ? " is-selected" : ""),
              onClick: () => {
                setSelectedLineId(line.id);
                setSelectedTakeId(null);
              },
            },
            create(
              "span",
              { className: "narration-line-title" },
              line.text[locale] ?? line.text["en-US"] ?? line.id,
            ),
            create(
              "span",
              { className: "narration-line-meta" },
              line.start.toFixed(1) +
                "–" +
                line.end.toFixed(1) +
                "s · " +
                lineTakes.length +
                (zh ? " 个 take" : " takes"),
            ),
          );
        }),
      )
    : null;

  const takeList =
    selectedLine && takes.length > 0
      ? create(
          "div",
          { className: "narration-takes" },
          takes.map(take =>
            create(
              "div",
              {
                key: take.id,
                className:
                  "narration-take" +
                  (take.id === selectedTakeId ? " is-selected" : ""),
              },
              create(
                "button",
                {
                  className: "icon-button",
                  title: playing === take.id ? (zh ? "暂停" : "Pause") : zh ? "播放" : "Play",
                  onClick: () => void playTake(take),
                },
                playing === take.id ? "❚❚" : "▶",
              ),
              create(
                "button",
                {
                  className: "narration-take-main",
                  onClick: () => selectTake(take),
                },
                create(
                  "span",
                  null,
                  take.id.slice(-6) + " · " + take.duration.toFixed(1) + "s",
                ),
                create(
                  "span",
                  { className: "narration-take-meta" },
                  take.active ? (zh ? "当前" : "active") : "",
                ),
              ),
              create(
                "button",
                {
                  className: "icon-button",
                  title: zh ? "设为当前" : "Set active",
                  disabled: take.active || busy,
                  onClick: () => void activateTakeTake(take),
                },
                "●",
              ),
              create(
                "button",
                {
                  className: "icon-button danger",
                  title: zh ? "删除" : "Delete",
                  disabled: busy,
                  onClick: () => void selectAndDelete(take),
                },
                "×",
              ),
            ),
          ),
        )
      : null;

  async function activateTakeTake(take: VoiceTake) {
    if (!selectedLine) return;
    setSelectedTakeId(take.id);
    setBusy(true);
    setError("");
    try {
      await updateTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        takeId: take.id,
        patch: { active: true },
      });
      await load(selectedLine.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function selectAndDelete(take: VoiceTake) {
    setSelectedTakeId(take.id);
    setDraft({ ...take });
    if (!window.confirm(zh ? "删除这个 take？" : "Delete this take?")) return;
    if (!selectedLine) return;
    setBusy(true);
    setError("");
    try {
      await removeTake({
        project: projectSlug,
        locale,
        lineId: selectedLine.id,
        takeId: take.id,
      });
      await load(selectedLine.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const editor = draft
    ? create(
        "div",
        { className: "narration-editor" },
        create(Waveform, {
          url: selectedLine
            ? audioUrl({
                project: projectSlug,
                locale,
                lineId: selectedLine.id,
                takeId: draft.id,
              })
            : "",
        }),
        create(
          "div",
          { className: "narration-fields" },
          create(NumberField, {
            label: zh ? "偏移 (s)" : "Offset (s)",
            value: draft.offset,
            step: 0.01,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, offset: value } : current)),
          }),
          create(NumberField, {
            label: zh ? "增益 (dB)" : "Gain (dB)",
            value: draft.gainDb,
            step: 0.5,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, gainDb: value } : current)),
          }),
          create(NumberField, {
            label: zh ? "裁剪入点 (s)" : "Trim in (s)",
            value: draft.trimStart,
            step: 0.01,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, trimStart: value } : current)),
          }),
          create(NumberField, {
            label: zh ? "裁剪出点 (s)" : "Trim out (s)",
            value: draft.trimEnd,
            step: 0.01,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, trimEnd: value } : current)),
          }),
          create(NumberField, {
            label: zh ? "淡入 (s)" : "Fade in (s)",
            value: draft.fadeIn,
            step: 0.01,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, fadeIn: value } : current)),
          }),
          create(NumberField, {
            label: zh ? "淡出 (s)" : "Fade out (s)",
            value: draft.fadeOut,
            step: 0.01,
            onInput: (value: number) =>
              setDraft(current => (current ? { ...current, fadeOut: value } : current)),
          }),
        ),
        create(
          "div",
          { className: "narration-actions" },
          create(
            "button",
            {
              className: "primary",
              disabled: busy,
              onClick: () => void saveDraft(),
            },
            zh ? "保存属性" : "Save properties",
          ),
          create(
            "button",
            {
              disabled: busy || draft.active,
              onClick: () => void activateTake(),
            },
            zh ? "设为当前" : "Set active",
          ),
          create(
            "button",
            {
              className: "danger",
              disabled: busy,
              onClick: () => void deleteTake(),
            },
            zh ? "删除 take" : "Delete take",
          ),
        ),
      )
    : null;

  return create(
    Pane,
    { title: zh ? "旁白" : "Narration", id: tab },
    create(
      "div",
      { className: "narration-root" },
      create(
        "div",
        { className: "narration-header" },
        create(
          "div",
          null,
          create("div", { className: "narration-title" }, zh ? "旁白录制" : "Narration"),
          create("div", { className: "narration-subtitle" }, project.name),
        ),
        create(Select, {
          title: zh ? "旁白语言" : "Narration language",
          value: locale,
          options: localeOptions.map(option => ({ ...option })),
          onChange: (value: NarrationLocale) => setLocale(value),
        }),
      ),
      create(
        "p",
        { className: "narration-note" },
        zh
          ? "逐行录制到 voiceover/。当前版本先完成录音、take 和属性编辑；视频同步预览在下一步接入。"
          : "Line-based recording into voiceover/. This slice covers recording, takes and properties; video-sync preview comes next.",
      ),
      error ? create("div", { className: "narration-error" }, error) : null,
      status ? create("div", { className: "narration-status" }, status) : null,
      loading ? create("div", { className: "narration-note" }, zh ? "加载中…" : "Loading…") : null,
      lineList,
      selectedLine
        ? create(
            "div",
            { className: "narration-record" },
            create(
              "button",
              {
                className: recording ? "danger" : "primary",
                disabled: busy || !selectedLine,
                onClick: () => void (recording ? stopRecording() : startRecording()),
              },
              recording
                ? zh
                  ? "停止并保存"
                  : "Stop and save"
                : zh
                  ? "录制当前行"
                  : "Record line",
            ),
            recording
              ? create("span", { className: "narration-timer" }, elapsed.toFixed(1) + "s")
              : null,
            create(
              "span",
              { className: "narration-target" },
              zh
                ? "目标 " + (selectedLine.end - selectedLine.start).toFixed(1) + "s"
                : "target " + (selectedLine.end - selectedLine.start).toFixed(1) + "s",
            ),
          )
        : null,
      takeList,
      editor,
    ),
  );
}
