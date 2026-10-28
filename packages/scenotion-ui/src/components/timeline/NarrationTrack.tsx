import styles from './Timeline.module.scss';

import {useCallback, useEffect, useMemo, useRef, useState} from 'preact/hooks';
import {useApplication, useTimelineContext} from '../../contexts';
import {usePlayerTime, usePreviewSettings} from '../../hooks';

type NarrationLocale = 'en-US' | 'zh-CN';

type NarrationLine = {
  id: string;
  scene: string;
  start: number;
  end: number;
  text: Partial<Record<NarrationLocale, string>>;
};

type VoiceTake = {
  id: string;
  lineId: string;
  locale: NarrationLocale;
  duration: number;
  offset: number;
  trimStart: number;
  trimEnd: number;
  active: boolean;
};

type NarrationData = {
  project: string;
  locale: NarrationLocale;
  lines: NarrationLine[];
  takes: Record<string, {takes: VoiceTake[]}>;
};

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project'
  );
}

function getVideoLocale(): NarrationLocale {
  const fromUrl = new URLSearchParams(window.location.search).get('locale');
  const value =
    fromUrl ??
    (() => {
      try {
        return localStorage.getItem('scenotion.videoLocale');
      } catch {
        return null;
      }
    })();
  return value?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function NarrationTrack() {
  const {player, project} = useApplication();
  const {fps} = usePreviewSettings();
  const {framesToPercents} = useTimelineContext();
  const time = usePlayerTime();
  const [data, setData] = useState<NarrationData | null>(null);
  const [error, setError] = useState(false);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recordError, setRecordError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const recordingLineRef = useRef<string | null>(null);
  const locale = getVideoLocale();
  const projectSlug = slugify(project.name);

  const load = useCallback(async () => {
    try {
      const response = await fetch(
        '/__scenotion/narration/manifest?project=' +
          encodeURIComponent(projectSlug) +
          '&locale=' +
          encodeURIComponent(locale),
      );
      if (!response.ok) {
        setData(null);
        setError(true);
        return;
      }
      setData((await response.json()) as NarrationData);
      setError(false);
    } catch {
      setError(true);
    }
  }, [projectSlug, locale]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 2500);
    const update = () => {
      void load();
    };
    window.addEventListener('scenotion:narration-changed', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('scenotion:narration-changed', update);
    };
  }, [load]);

  const currentLine = useMemo(() => {
    if (!data) return null;
    const visibleLine = data.lines.find(
      line => time.frame >= line.start * fps && time.frame < line.end * fps,
    );
    return (
      visibleLine ??
      data.lines.find(line => !(data.takes[line.id]?.takes.length ?? 0)) ??
      data.lines[0] ??
      null
    );
  }, [data, fps, time.frame]);

  const clips = useMemo(() => {
    if (!data) return [];
    const result: {
      key: string;
      left: string;
      width: string;
      label: string;
      startFrame: number;
      active: boolean;
    }[] = [];
    for (const line of data.lines) {
      const takes = data.takes[line.id]?.takes ?? [];
      const take = takes.find(value => value.active) ?? takes[0];
      if (!take) continue;
      const start = line.start + take.offset + take.trimStart;
      const end = line.start + take.offset + take.trimEnd;
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        continue;
      }
      const startFrame = Math.max(0, Math.round(start * fps));
      const endFrame = Math.max(startFrame + 1, Math.round(end * fps));
      result.push({
        key: take.id,
        left: framesToPercents(startFrame) + '%',
        width: framesToPercents(endFrame - startFrame) + '%',
        label: line.text[locale] ?? line.id,
        startFrame,
        active: take.active,
      });
    }
    return result;
  }, [data, fps, framesToPercents, locale]);

  const cleanupRecorder = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    recordingLineRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        if (recorder.state !== 'inactive') recorder.stop();
      }
      cleanupRecorder();
    };
  }, [cleanupRecorder]);

  const startRecording = async () => {
    if (!currentLine || recording || busy) return;
    setRecordError('');
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not available.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const mimeType =
        MIME_CANDIDATES.find(value => MediaRecorder.isTypeSupported(value)) ?? '';
      const recorder = mimeType
        ? new MediaRecorder(stream, {mimeType})
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordError('The microphone recorder failed.');
        setRecording(false);
        cleanupRecorder();
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      recordingLineRef.current = currentLine.id;
      startedAtRef.current = performance.now();
      recorder.start(250);
      setRecording(true);
    } catch (err) {
      cleanupRecorder();
      setRecordError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    const lineId = recordingLineRef.current;
    if (!recorder || !lineId) return;
    const duration = Math.max(0.1, (performance.now() - startedAtRef.current) / 1000);
    setBusy(true);
    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, {type: mimeType});
      cleanupRecorder();
      setRecording(false);
      try {
        const query = new URLSearchParams({
          project: projectSlug,
          locale,
          line: lineId,
          duration: String(duration),
        });
        const response = await fetch('/__scenotion/narration/take?' + query, {
          method: 'POST',
          headers: {'Content-Type': mimeType},
          body: blob,
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        await load();
        window.dispatchEvent(new Event('scenotion:narration-changed'));
      } catch (err) {
        setRecordError(errorMessage(err));
      } finally {
        setBusy(false);
      }
    };
    recorder.stop();
  };

  return (
    <div className={styles.narrationTrack}>
      <div className={styles.narrationTrackLabel}>
        <span>
          VOICE {locale}
          {error ? ' · no script' : ''}
        </span>
        <button
          className={
            styles.narrationRecord + (recording ? ' ' + styles.recording : '')
          }
          disabled={!currentLine || busy}
          title={
            currentLine
              ? (recording ? 'Stop and save' : 'Record line ') + currentLine.id
              : 'No narration line at the playhead'
          }
          onClick={event => {
            event.stopPropagation();
            if (recording) stopRecording();
            else void startRecording();
          }}
        >
          {recording ? '■ STOP' : '● REC'}
        </button>
        {recordError ? <span title={recordError}>!</span> : null}
      </div>
      <div className={styles.narrationLane}>
        {clips.map(clip => (
          <div
            key={clip.key}
            className={
              styles.narrationClip +
              (clip.active ? ' ' + styles.narrationClipActive : '')
            }
            style={{left: clip.left, width: clip.width}}
            title={clip.label}
            onPointerDown={event => {
              event.stopPropagation();
            }}
            onClick={event => {
              event.stopPropagation();
              player.requestSeek(clip.startFrame);
            }}
          >
            <span>{clip.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
