import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeAnnotations?scene";

export default makeProject({
  name: "Code Annotations",
  scenes: [scene],
  experimentalFeatures: true,
});
