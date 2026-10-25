import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeWorkflow?scene";

export default makeProject({
  name: "Code Workflow",
  scenes: [scene],
  experimentalFeatures: true,
});
