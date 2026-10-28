import { h } from "preact";
import { Pane, Science, Select, Tab, Tune } from "@scenotion/ui";
import {
  getEditorLocale,
  getVideoLocale,
  setEditorLocale,
  setVideoLocale,
  type EditorLocale,
  type VideoLocale,
} from "./i18n";
import { NarrationPane } from "./narration/panel";

const create = h as any;

const localeOptions = [
  { value: "en-US", text: "English" },
  { value: "zh-CN", text: "简体中文" },
] as const;

function Row({ label, children }: { label: string; children: unknown }) {
  return create(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      },
    },
    create("span", { style: { color: "var(--text-color)" } }, label),
    children,
  );
}

function ScenotionPane({ tab }: { tab: string }) {
  const zh = getEditorLocale() === "zh-CN";
  const editorLocale = getEditorLocale();
  const videoLocale = getVideoLocale();

  return create(
    Pane,
    { title: "Scenotion", id: tab },
    create(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "12px",
          color: "var(--text-color)",
        },
      },
      create("div", { style: { fontWeight: 700, fontSize: "15px" } }, "Scenotion"),
      create(
        "p",
        { style: { margin: 0, color: "var(--text-color-secondary)", lineHeight: 1.5 } },
        zh
          ? "项目级设置。切换语言会重新加载编辑器。"
          : "Project-level settings. Changing a language reloads the editor.",
      ),
      create(
        Row,
        { label: zh ? "编辑器语言" : "Editor language" },
        create(Select, {
          title: zh ? "编辑器语言" : "Editor language",
          value: editorLocale,
          options: localeOptions.map(option => ({ ...option })),
          onChange: (value: EditorLocale) => setEditorLocale(value),
        }),
      ),
      create(
        Row,
        { label: zh ? "视频语言" : "Video language" },
        create(Select, {
          title: zh ? "视频语言" : "Video language",
          value: videoLocale,
          options: localeOptions.map(option => ({ ...option })),
          onChange: (value: VideoLocale) => setVideoLocale(value),
        }),
      ),
      create(
        "p",
        { style: { margin: 0, color: "var(--text-color-secondary)", lineHeight: 1.5 } },
        zh
          ? "视频语言会写入 URL 的 ?locale= 参数；渲染和预览使用同一套场景文案。"
          : "The video language is written to ?locale= and is used by both preview and render.",
      ),
    ),
  );
}

function ScenotionTab({ tab }: { tab: string }) {
  return create(
    Tab,
    { title: "Scenotion", id: "scenotion-tab", tab },
    create(Science, null),
  );
}

function NarrationTab({ tab }: { tab: string }) {
  return create(
    Tab,
    { title: "Narration", id: "narration-tab", tab },
    create(Tune, null),
  );
}

export function createScenotionPlugin() {
  return {
    name: "@scenotion/editor",
    tabs: [
      {
        name: "scenotion",
        tabComponent: ScenotionTab,
        paneComponent: ScenotionPane,
      },
      {
        name: "narration",
        tabComponent: NarrationTab,
        paneComponent: NarrationPane,
      },
    ],
  };
}
