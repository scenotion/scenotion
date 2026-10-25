import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeScrollScene?scene";

export default makeProject({
  name: "Code Viewport",
  scenes: [scene],
  experimentalFeatures: true,
});
