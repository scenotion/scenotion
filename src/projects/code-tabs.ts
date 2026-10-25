import { makeProject } from "@motion-canvas/core";
import scene from "../scenes/CodeTabsScene?scene";

export default makeProject({
  name: "Code Tabs",
  scenes: [scene],
  experimentalFeatures: true,
});
