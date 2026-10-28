import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

const create = h as any;

export function Waveform({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = (peaks: number[]) => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(0,0,0,0.20)";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "rgba(255,255,255,0.12)";
      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(width, height / 2);
      context.stroke();
      if (peaks.length === 0) return;
      const step = width / peaks.length;
      context.fillStyle = "rgba(0, 200, 83, 0.85)";
      peaks.forEach((peak, index) => {
        const bar = Math.max(2, peak * (height - 8));
        context.fillRect(
          index * step,
          (height - bar) / 2,
          Math.max(1, step - 1),
          bar,
        );
      });
    };

    draw([]);
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("audio unavailable");
        return response.arrayBuffer();
      })
      .then(buffer => {
        const audioContext = new AudioContext();
        return audioContext.decodeAudioData(buffer).finally(() => {
          void audioContext.close();
        });
      })
      .then(audio => {
        if (cancelled) return;
        const data = audio.getChannelData(0);
        const bucketCount = 96;
        const bucketSize = Math.max(1, Math.floor(data.length / bucketCount));
        const peaks: number[] = [];
        for (let bucket = 0; bucket < bucketCount; bucket++) {
          let peak = 0;
          const start = bucket * bucketSize;
          const end = Math.min(data.length, start + bucketSize);
          for (let index = start; index < end; index++) {
            peak = Math.max(peak, Math.abs(data[index]));
          }
          peaks.push(Math.min(1, peak * 2.4));
        }
        draw(peaks);
      })
      .catch(() => {
        if (!cancelled) draw([]);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return create("canvas", {
    ref,
    width: 360,
    height: 56,
    className: "narration-waveform",
  });
}
