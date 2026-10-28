import type { MessageKey } from "./en-US";

export const zhCN = {
  "frame.meta": "MOTION CANVAS / 4K60 READY",

  "status.source": "源码",
  "status.edited": "已编辑",
  "status.before": "修改前",
  "status.after": "修改后",

  "codeWorkflow.index": "00 / 代码",
  "codeWorkflow.label": "代码工作流",
  "codeWorkflow.title": "代码就是时间轴。",
  "codeWorkflow.subtitle":
    "一个通用代码场景：语法高亮、行号、选区、代码切换，以及绑定到代码的 callout。",
  "codeWorkflow.footer": "scenotion / code-workflow",
  "codeWorkflow.annotation": "trim + 回退",

  "codeDiff.index": "01 / 代码",
  "codeDiff.label": "代码对比",
  "codeDiff.title": "展示变化。",
  "codeDiff.subtitle":
    "两个同步的代码面板。变化的行被选中，其余代码保持可见以便比较。",
  "codeDiff.footer": "scenotion / code-diff",

  "codeScroll.index": "02 / 代码",
  "codeScroll.label": "代码视口",
  "codeScroll.title": "滚动窗口。",
  "codeScroll.subtitle":
    "长代码文件保持在固定视口内，行号保留原始编号。",
  "codeScroll.footer": "scenotion / code-scroll",

  "codeTabs.index": "03 / 代码",
  "codeTabs.label": "文件标签",
  "codeTabs.title": "文件也是时间轴。",
  "codeTabs.subtitle":
    "切换文件而不丢失连续性。标签有自己的 spring，代码在独立轨道上擦除。",
  "codeTabs.footer": "scenotion / code-tabs",

  "codeAnnotations.index": "04 / 代码",
  "codeAnnotations.label": "注释",
  "codeAnnotations.title": "注释跟随代码。",
  "codeAnnotations.subtitle":
    "callout、错误下划线、括号对和行注释在编辑后重新锚定。",
  "codeAnnotations.footer": "scenotion / code-annotations",
  "codeAnnotations.fallback": "回退路径",
  "codeAnnotations.target": "目标分支",

  "codeTransitionDebug.index": "05 / 代码",
  "codeTransitionDebug.label": "/ 转场调试",
  "codeTransitionDebug.title": "五种转场，一套 API。",
  "codeTransitionDebug.subtitle":
    "固定验证：snappy、smooth、cinematic、wipe 和 quick。",
  "codeTransitionDebug.footer": "scenotion / code-transition-debug",

  "cliff.index": "01 / 03",
  "cliff.label": "CLIFF 格式",
  "cliff.title": "带上下文的代码。",
  "cliff.subtitle":
    "面向本地化工作的行式格式，为人和 LLM 而设计。",
  "cliff.footer": "scenotion / cliff-format",

  "architecture.index": "02 / 03",
  "architecture.label": "架构",
  "architecture.title": "让结构可见。",
  "architecture.subtitle":
    "节点、边和层，镜头从系统移动到决策。",
  "architecture.footer": "scenotion / architecture",
  "architectureMap.source.title": "源",
  "architectureMap.source.detail": "代码 / 数据",
  "architectureMap.transform.title": "转换",
  "architectureMap.transform.detail": "规则 + 上下文",
  "architectureMap.render.title": "渲染",
  "architectureMap.render.detail": "帧 / 视频",
  "architectureMap.caption": "抽象流水线 / 一种可能的分解",

  "algorithms.index": "03 / 03",
  "algorithms.label": "算法",
  "algorithms.title": "给追踪一个身体。",
  "algorithms.subtitle":
    "确定性追踪变成数组、网格、图和游戏板。",
  "algorithms.footer": "scenotion / algorithms",
  "algorithmBars.header": "数组 / 活动索引",
  "algorithmBars.complexity": "O(n log n)",
  "algorithmBars.footer": "可视化层 / 确定性追踪将在这里实现",
} satisfies Record<MessageKey, string>;
