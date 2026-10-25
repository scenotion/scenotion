import { HighlightStyle } from "@codemirror/language";
import { LezerHighlighter } from "@motion-canvas/2d";
import { parser as javascript } from "@lezer/javascript";
import { parser as json } from "@lezer/json";
import { parser as python } from "@lezer/python";
import { tags } from "@lezer/highlight";
import { theme } from "../theme";

export const codeStyle = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.modifier, tags.self],
    color: "#FF7A90",
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: "#F3C969",
  },
  {
    tag: [tags.typeName, tags.className, tags.namespace],
    color: "#7DCFFF",
  },
  {
    tag: [tags.string, tags.special(tags.string)],
    color: "#A6E3A1",
  },
  {
    tag: [tags.number, tags.bool, tags.null],
    color: "#F5A97F",
  },
  {
    tag: [tags.comment, tags.meta],
    color: "#6F7A70",
  },
  {
    tag: [tags.operator, tags.punctuation, tags.bracket],
    color: "#A6ADC8",
  },
  {
    tag: [tags.propertyName, tags.attributeName],
    color: "#CBA6F7",
  },
  {
    tag: [tags.variableName, tags.name],
    color: theme.text,
  },
]);

export const codeHighlighters = {
  ts: new LezerHighlighter(javascript, codeStyle),
  js: new LezerHighlighter(javascript, codeStyle),
  json: new LezerHighlighter(json, codeStyle),
  py: new LezerHighlighter(python, codeStyle),
} as const;

export type CodeLanguage = keyof typeof codeHighlighters;
