import { options } from "preact";
import type { VNode } from "preact";

export type EditorLocale = "en-US" | "zh-CN";
export type VideoLocale = "en-US" | "zh-CN";

const EDITOR_KEY = "scenotion.editor.locale";
const VIDEO_KEY = "scenotion.videoLocale";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeLocale(value: string | null | undefined): EditorLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-CN";
  if (normalized === "en" || normalized.startsWith("en-")) return "en-US";
  return null;
}

export function getEditorLocale(): EditorLocale {
  if (typeof window !== "undefined") {
    const fromUrl = normalizeLocale(new URLSearchParams(window.location.search).get("ui"));
    if (fromUrl) return fromUrl;
  }
  return normalizeLocale(readStorage(EDITOR_KEY)) ?? "en-US";
}

export function getVideoLocale(): VideoLocale {
  if (typeof window !== "undefined") {
    const fromUrl = normalizeLocale(new URLSearchParams(window.location.search).get("locale"));
    if (fromUrl) return fromUrl;
  }
  return normalizeLocale(readStorage(VIDEO_KEY)) ?? "en-US";
}

function setUrlParam(key: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.location.href = url.toString();
}

export function setEditorLocale(locale: EditorLocale): void {
  try {
    localStorage.setItem(EDITOR_KEY, locale);
  } catch {
    // Ignore restricted storage.
  }
  setUrlParam("ui", locale);
}

export function setVideoLocale(locale: VideoLocale): void {
  try {
    localStorage.setItem(VIDEO_KEY, locale);
  } catch {
    // Ignore restricted storage.
  }
  setUrlParam("locale", locale);
}

const uiZh: Record<string, string> = {
  "Project Selection": "项目选择",
  "Projects": "项目",
  "Video Settings": "视频设置",
  "Scene Graph": "场景图",
  "Threads": "线程",
  "Thread Debugger": "线程调试",
  "Console": "控制台",
  "Settings": "设置",
  "Timeline": "时间轴",
  "Docs": "文档",
  "Narration": "旁白",
  "Experimental features enabled": "已启用实验性功能",
  "Render": "渲染",
  "Present": "演示",
  "Abort": "中止",
  "Aborting": "正在中止",
  "Output Directory": "输出目录",
  "Reveal the output directory in file explorer": "在文件资源管理器中打开输出目录",
  "General": "常规",
  "background": "背景",
  "range": "范围",
  "end": "结束",
  "resolution": "分辨率",
  "Preview": "预览",
  "frame rate": "帧率",
  "scale": "缩放",
  "Rendering": "渲染",
  "color space": "色彩空间",
  "exporter": "导出器",
  "fast start": "快速启动",
  "include audio": "包含音频",
  "audio offset": "音频偏移",
  "30 FPS": "30 FPS",
  "60 FPS": "60 FPS",
  "0.25x (Quarter)": "0.25x（四分之一）",
  "0.5x (Half)": "0.5x（一半）",
  "1.0x (Full)": "1.0x（完整）",
  "2.0x (Double)": "2.0x（双倍）",
  "sRGB": "sRGB",
  "DCI-P3": "DCI-P3",
  "Image sequence": "图像序列",
  "Video (FFmpeg)": "视频（FFmpeg）",
  "Current time [HH:MM:SS:FF]": "当前时间 [HH:MM:SS:FF]",
  "Current frame": "当前帧",
  "Playback speed": "播放速度",
  "Mute audio [M]": "静音 [M]",
  "Unmute audio [M]": "取消静音 [M]",
  "Start [Shift + Left arrow]": "开头 [Shift + 左箭头]",
  "Previous frame [Left arrow]": "上一帧 [左箭头]",
  "Play [Space]": "播放 [Space]",
  "Pause [Space]": "暂停 [Space]",
  "Next frame [Right arrow]": "下一帧 [右箭头]",
  "End [Shift + Right arrow]": "结尾 [Shift + 右箭头]",
  "Enable looping [L]": "开启循环 [L]",
  "Disable looping [L]": "关闭循环 [L]",
  "Current framerate": "当前帧率",
  "Save snapshot": "保存快照",
  "Duration in frames": "持续帧数",
  "Duration [HH:MM:SS:FF]": "时长 [HH:MM:SS:FF]",
  "Go to source": "转到源码",
  "Copy version information": "复制版本信息",
  "Change zoom": "改变缩放",
  "Recenter": "重新居中",
  "Toggle grid [']": "切换网格 [']",
  "Use color picker [I]": "使用取色器 [I]",
  "Coordinates": "坐标",
  "Show inspector": "显示检查器",
  "Clear console": "清空控制台",
  "Related object:": "相关对象：",
  "Select related node": "选择相关节点",
  "The problem occurred here:": "问题发生在这里：",
  "Zoom to fit": "缩放以适应",
  "PAUSED": "已暂停",
  "Elapsed": "已用时间",
  "ETA:": "预计剩余：",
  "Duration": "时长",
  "Appearance": "外观",
  "Defaults": "默认值",
  "Application Settings": "应用设置",
  "accent color": "强调色",
  "legacy font": "传统字体",
  "coordinates": "坐标",
  "The current scene doesn't support threading": "当前场景不支持线程",
  "UPDATE AVAILABLE": "有可用更新",
  "See what's new": "查看新内容",
  "SLIDES": "幻灯片",
  "none": "无",
  "alpha": "透明度",
  "red": "红",
  "green": "绿",
  "blue": "蓝",
  "top": "上",
  "right": "右",
  "bottom": "下",
  "left": "左",
  "Version": "版本",
};

export function translateUiString(value: string): string {
  const exact = uiZh[value];
  if (exact) return exact;

  const trimmed = value.trim();
  if (trimmed !== value && uiZh[trimmed]) {
    return value.replace(trimmed, uiZh[trimmed]);
  }

  const consoleMatch = /^Console \((\d+)\)$/.exec(value);
  if (consoleMatch) return `控制台 (${consoleMatch[1]})`;

  if (value.startsWith("Elapsed: ")) return "已用时间：" + value.slice(9);
  if (value.startsWith("ETA: ")) return "预计剩余：" + value.slice(5);

  return value;
}

const ATTRS = [
  "title",
  "placeholder",
  "aria-label",
  "alt",
  "label",
  "text",
  "titleOn",
  "titleOff",
  "frameTitle",
] as const;

function translateChildren(value: unknown): unknown {
  if (typeof value === "string") return translateUiString(value);
  if (Array.isArray(value)) return value.map(translateChildren);
  return value;
}

function translateVNode(vnode: VNode): void {
  const props = vnode.props as Record<string, unknown> | null;
  if (!props || typeof props !== "object") return;
  if ("children" in props) {
    props.children = translateChildren(props.children);
  }
  for (const key of ATTRS) {
    if (typeof props[key] === "string") {
      props[key] = translateUiString(props[key] as string);
    }
  }
  if (props.value === "PAUSED") {
    props.value = "已暂停";
  }
}

let installed = false;

export function installUiTranslation(): void {
  if (installed) return;
  installed = true;
  if (getEditorLocale() !== "zh-CN") return;

  const previous = options.vnode;
  options.vnode = (vnode: VNode) => {
    previous?.(vnode);
    translateVNode(vnode);
  };
}
