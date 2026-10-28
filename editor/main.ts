import {
  editor as stockEditor,
  index as stockIndex,
} from "@motion-canvas/ui";
import { getEditorLocale, installUiTranslation } from "./i18n";
import { createScenotionPlugin } from "./plugin";

installUiTranslation();

function prepareDocument(): void {
  document.documentElement.lang = getEditorLocale();
}

export function editor(project: any): void {
  prepareDocument();
  const plugin = createScenotionPlugin();
  project.plugins ??= [];
  if (!project.plugins.some((value: any) => value?.name === plugin.name)) {
    project.plugins.push(plugin);
  }
  stockEditor(project);
  document.title = `${project.name} | Scenotion`;
}

export function index(projects: any): void {
  prepareDocument();
  stockIndex(projects);
  document.title = "Scenotion";
}
