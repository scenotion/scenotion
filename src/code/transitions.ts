import type { TimingFunction } from "@motion-canvas/core";
import { easeInOutCubic, easeOutCubic } from "@motion-canvas/core";

export type CodeTransitionPreset = {
  duration: number;
  ease: TimingFunction;
};

export type CodeTransitionPresetName = "snappy" | "smooth" | "cinematic";

export const codeTransitionPresets: Record<
  CodeTransitionPresetName,
  CodeTransitionPreset
> = {
  snappy: { duration: 0.6, ease: easeOutCubic },
  smooth: { duration: 1.2, ease: easeInOutCubic },
  cinematic: { duration: 1.8, ease: easeInOutCubic },
};

export type CodeTransitionPresetInput =
  | CodeTransitionPresetName
  | Partial<CodeTransitionPreset>;

export function resolveCodeTransitionPreset(
  input: CodeTransitionPresetInput = "smooth",
): CodeTransitionPreset {
  if (typeof input === "string") return codeTransitionPresets[input];
  return { ...codeTransitionPresets.smooth, ...input };
}

export type FileTransitionPreset = {
  duration: number;
  ease: TimingFunction;
};

export type FileTransitionPresetName = "wipe" | "quick";

export const fileTransitionPresets: Record<
  FileTransitionPresetName,
  FileTransitionPreset
> = {
  wipe: { duration: 0.9, ease: easeInOutCubic },
  quick: { duration: 0.55, ease: easeOutCubic },
};

export type FileTransitionPresetInput =
  | FileTransitionPresetName
  | Partial<FileTransitionPreset>;

export function resolveFileTransitionPreset(
  input: FileTransitionPresetInput = "wipe",
): FileTransitionPreset {
  if (typeof input === "string") return fileTransitionPresets[input];
  return { ...fileTransitionPresets.wipe, ...input };
}

export type AnnotationTransitionPreset = {
  reveal: number;
  hide: number;
  reposition: number;
};

export type AnnotationTransitionPresetName =
  | "quick"
  | "editorial"
  | "cinematic";

export const annotationTransitionPresets: Record<
  AnnotationTransitionPresetName,
  AnnotationTransitionPreset
> = {
  quick: { reveal: 0.3, hide: 0.1, reposition: 0.3 },
  editorial: { reveal: 0.5, hide: 0.15, reposition: 0.45 },
  cinematic: { reveal: 0.8, hide: 0.3, reposition: 0.7 },
};

export type AnnotationTransitionPresetInput =
  | AnnotationTransitionPresetName
  | Partial<AnnotationTransitionPreset>;

export function resolveAnnotationTransitionPreset(
  input: AnnotationTransitionPresetInput = "editorial",
): AnnotationTransitionPreset {
  if (typeof input === "string") return annotationTransitionPresets[input];
  return { ...annotationTransitionPresets.editorial, ...input };
}
