export const enUS = {
  "frame.meta": "MOTION CANVAS / 4K60 READY",

  "status.source": "SOURCE",
  "status.edited": "EDITED",
  "status.before": "BEFORE",
  "status.after": "AFTER",

  "codeWorkflow.index": "00 / CODE",
  "codeWorkflow.label": "CODE WORKFLOW",
  "codeWorkflow.title": "Code is a timeline.",
  "codeWorkflow.subtitle":
    "A generic code scene: syntax highlighting, line numbers, selection, a code transition and a code-bound callout.",
  "codeWorkflow.footer": "scenotion / code-workflow",
  "codeWorkflow.annotation": "trim + fallback",

  "codeDiff.index": "01 / CODE",
  "codeDiff.label": "CODE DIFF",
  "codeDiff.title": "Show the change.",
  "codeDiff.subtitle":
    "Two synchronized code panes. The changed line is selected, while the rest of the code stays visible for comparison.",
  "codeDiff.footer": "scenotion / code-diff",

  "codeScroll.index": "02 / CODE",
  "codeScroll.label": "CODE VIEWPORT",
  "codeScroll.title": "Scroll the window.",
  "codeScroll.subtitle":
    "A long code file stays inside a fixed viewport while the gutter keeps the original line numbers.",
  "codeScroll.footer": "scenotion / code-scroll",

  "codeTabs.index": "03 / CODE",
  "codeTabs.label": "FILE TABS",
  "codeTabs.title": "Files are a timeline.",
  "codeTabs.subtitle":
    "Switch files without losing continuity. Tabs lead with their own spring; code wipes on a separate track.",
  "codeTabs.footer": "scenotion / code-tabs",

  "codeAnnotations.index": "04 / CODE",
  "codeAnnotations.label": "ANNOTATIONS",
  "codeAnnotations.title": "Annotations follow the code.",
  "codeAnnotations.subtitle":
    "Callout, error underline, bracket pair and line note all re-anchor after the edit.",
  "codeAnnotations.footer": "scenotion / code-annotations",
  "codeAnnotations.fallback": "fallback path",
  "codeAnnotations.target": "target branch",

  "codeTransitionDebug.index": "05 / CODE",
  "codeTransitionDebug.label": "/ TRANSITION DEBUG",
  "codeTransitionDebug.title": "Five transitions, one API.",
  "codeTransitionDebug.subtitle":
    "Fixed validation: snappy, smooth, cinematic, wipe and quick.",
  "codeTransitionDebug.footer": "scenotion / code-transition-debug",

  "cliff.index": "01 / 03",
  "cliff.label": "CLIFF FORMAT",
  "cliff.title": "Code, with context.",
  "cliff.subtitle":
    "A line-oriented format for localization work, built for humans and LLMs.",
  "cliff.footer": "scenotion / cliff-format",

  "architecture.index": "02 / 03",
  "architecture.label": "ARCHITECTURE",
  "architecture.title": "Make structure visible.",
  "architecture.subtitle":
    "Nodes, edges and layers, with a camera that moves from system to decision.",
  "architecture.footer": "scenotion / architecture",
  "architectureMap.source.title": "Source",
  "architectureMap.source.detail": "code / data",
  "architectureMap.transform.title": "Transform",
  "architectureMap.transform.detail": "rules + context",
  "architectureMap.render.title": "Render",
  "architectureMap.render.detail": "frames / video",
  "architectureMap.caption": "abstract pipeline / one possible decomposition",

  "algorithms.index": "03 / 03",
  "algorithms.label": "ALGORITHMS",
  "algorithms.title": "Give the trace a body.",
  "algorithms.subtitle":
    "A deterministic trace becomes arrays, grids, graphs and game boards.",
  "algorithms.footer": "scenotion / algorithms",
  "algorithmBars.header": "array / active index",
  "algorithmBars.complexity": "O(n log n)",
  "algorithmBars.footer": "visualization layer / deterministic trace goes here",
} as const;

export type MessageKey = keyof typeof enUS;
