<h1 align="center">Scenotion</h1>

<p align="center">
  <a href="./README.md">English</a>
  &nbsp;·&nbsp;
  <strong>简体中文</strong>
</p>

Scenotion 是构建在 Motion Canvas 之上的技术视频组件层，用于代码讲解、diff、注释、图表、算法追踪和公式；基础 3D 在计划中。

Scenotion 是独立项目，与 Motion Canvas 无隶属关系。

## 范围

`0.1.0` 是代码场景里程碑。

已实现：

- TS、JS、JSON、Python 的 Lezer 高亮。
- `CodeStage`：文件名、语言、行号、focus、自动适配、裁剪 viewport。
- 行级代码切换，处理插入/替换/删除。
- 文件标签、并排 diff、滚动 viewport。
- callout、下划线、括号、行注释，并跟随行计划。
- 代码、文件、注释切换预设。
- 4K60 元数据和 FFmpeg MP4 导出。

未实现：

- 本地化 catalog、locale 变体和按语言渲染。
- 音频、旁白同步、字幕渲染与导出。
- 3D、模型加载、SDF shader 和模拟。
- 数学/论文版式、数据驱动图表和算法追踪。
- 批量/无头渲染、参数化变体和编码格式。
- 自动化测试和 CI。

CLIFF、架构、算法项目是静态视觉演示；CLIFF 项目不解析 CLIFF。

## 运行

~~~bash
npm install
npm run serve
~~~

Vite 会输出编辑器地址。所有项目都注册在 `vite.config.ts`。

| 脚本 | 用途 |
| --- | --- |
| `npm run serve` | Motion Canvas 编辑器和预览 |
| `npm run check` | TypeScript 检查 |
| `npm run build` | 类型检查后构建生产包 |
| `npm run review` | 从 MP4 导出 720p 审查片 |

目前没有 `npm test`。

## 项目

| 项目 | 入口 | 状态 |
| --- | --- | --- |
| Code Workflow | `src/projects/code-workflow.ts` | 代码场景 |
| Code Diff | `src/projects/code-diff.ts` | 代码场景 |
| Code Viewport | `src/projects/code-scroll.ts` | 代码场景 |
| Code Tabs | `src/projects/code-tabs.ts` | 代码场景 |
| Code Annotations | `src/projects/code-annotations.ts` | 代码场景 |
| Code Transition Debug | `src/projects/code-transition-debug.ts` | 代码场景 |
| Feature Validation | `src/projects/feature-validation.ts` | 审查片 |
| CLIFF Format | `src/projects/cliff-format.ts` | 静态演示 |
| Architecture | `src/projects/architecture.ts` | 静态演示 |
| Algorithms | `src/projects/algorithms.ts` | 静态演示 |

## 代码 API

~~~tsx
const code = createRef<Code>();
const transition = createCodeTransition("smooth");

view.add(
  <CodeStage
    codeRef={code}
    code={before}
    nextCode={after}
    transition={transition}
    filename="resolver.ts"
    language="ts"
    focus={lines(5, 6)}
  />,
);

yield* transition.play();
~~~

- 每个 `CodeStage` 只处理一个 `nextCode` 目标；多步序列未实现。
- 通过 `createCodeAnnotations(code)` 创建的注释会在行计划切换后重新锚定；独立的 `createCodeAnnotation(code, spec)` 不会。
- viewport 只垂直滚动，长行被裁切而不是换行。
- 支持的语言固定在 `src/code/highlight.ts`。

## 渲染

Story 项目使用 1920x1080 设计坐标、2.0x 渲染缩放、60fps 和 FFmpeg exporter。Feature Validation 为审查使用 1.0x / 1080p。

~~~bash
npm run review -- "output/Feature Validation.mp4" feature-validation
~~~

审查脚本只保留视频（`-an`）。需要音频时使用原始渲染。

## 结构

~~~text
src/
  code/        代码渲染、切换、注释
  components/  可复用视觉组件
  scenes/      场景实现
  projects/    项目入口与 .meta 配置
  theme/       tokens 与 SceneFrame
docs/          设计说明
~~~

## 文档

- [切换预设](./docs/transitions.md)
- [第三方声明](./THIRD_PARTY_NOTICES.md)

## 许可证

MIT。见 [LICENSE](./LICENSE)。

Copyright (c) 2026 Saikel-Orado-Liu aka GameGeek-Saikel.
