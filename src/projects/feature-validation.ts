import { makeProject } from "@motion-canvas/core";
import codeWorkflow from "../scenes/CodeWorkflow?scene";
import codeDiff from "../scenes/CodeDiffScene?scene";
import codeScroll from "../scenes/CodeScrollScene?scene";
import codeTabs from "../scenes/CodeTabsScene?scene";
import codeAnnotations from "../scenes/CodeAnnotations?scene";
import codeTransitionDebug from "../scenes/CodeTransitionDebug?scene";

export default makeProject({
  name: "Feature Validation",
  scenes: [
    codeWorkflow,
    codeDiff,
    codeScroll,
    codeTabs,
    codeAnnotations,
    codeTransitionDebug,
  ],
  experimentalFeatures: true,
});
