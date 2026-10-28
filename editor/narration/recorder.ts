export type RecordingResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;
  private mimeType = "audio/webm";

  async start(): Promise<void> {
    if (this.recorder) throw new Error("A recording is already in progress.");
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone capture is not available in this browser.");
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
      MIME_CANDIDATES.find(value => MediaRecorder.isTypeSupported(value)) ?? "";
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    this.stream = stream;
    this.recorder = recorder;
    this.chunks = [];
    this.startedAt = performance.now();
    this.mimeType = recorder.mimeType || mimeType || "audio/webm";
    recorder.ondataavailable = event => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    recorder.start(250);
  }

  async stop(): Promise<RecordingResult> {
    const recorder = this.recorder;
    if (!recorder) throw new Error("No recording is in progress.");
    const duration = Math.max(0.1, (performance.now() - this.startedAt) / 1000);
    return new Promise<RecordingResult>((resolve, reject) => {
      recorder.onerror = () => {
        this.cleanup();
        reject(new Error("The microphone recorder failed."));
      };
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mimeType,
        });
        this.cleanup();
        resolve({ blob, duration, mimeType: this.mimeType });
      };
      recorder.stop();
    });
  }

  cancel(): void {
    const recorder = this.recorder;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== "inactive") recorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.recorder = null;
    this.chunks = [];
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }
  }
}
