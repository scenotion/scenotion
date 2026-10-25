import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeTransitionDebug?scene";

export default makeProject({
  name: "Code Transition Debug",
  scenes: [scene],
  experimentalFeatures: true,
});
