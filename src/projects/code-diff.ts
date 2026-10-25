import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeDiffScene?scene";

export default makeProject({
  name: "Code Diff",
  scenes: [scene],
  experimentalFeatures: true,
});
