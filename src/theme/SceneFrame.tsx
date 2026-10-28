import { Layout, Rect, Txt } from "@motion-canvas/2d";
import type { Node } from "@motion-canvas/2d";
import type { SignalValue } from "@motion-canvas/core";
import { t } from "../i18n";
import { AutoText } from "../i18n/AutoText";
import { theme } from "./tokens";

type SceneFrameProps = {
  index: SignalValue<string>;
  label: SignalValue<string>;
  title: SignalValue<string>;
  subtitle: SignalValue<string>;
  footer: SignalValue<string>;
  meta?: SignalValue<string>;
  children?: Node | Node[];
};

function readText(value: SignalValue<string>): string {
  return typeof value === "function" ? value() : value;
}

export function SceneFrame({
  index,
  label,
  title,
  subtitle,
  footer,
  meta = () => t("frame.meta"),
  children,
}: SceneFrameProps) {
  return (
    <Rect
      width={theme.layout.width}
      height={theme.layout.height}
      fill={theme.background}
    >
      <Layout layout
        width={theme.layout.width}
        height={theme.layout.height}
        padding={theme.layout.safe}
        direction="column"
        justifyContent="space-between"
      >
        <Layout layout direction="row" justifyContent="space-between" alignItems="center">
          <Layout layout direction="row" gap={14} alignItems="center">
            <Rect width={10} height={10} radius={5} fill={theme.accent} />
            <Txt
              text="SCENOTION"
              fill={theme.accent}
              fontFamily={theme.font.sans}
              fontSize={18}
              fontWeight={700}
              letterSpacing={3}
            />
            <Txt
              text={() => "/ " + readText(label)}
              fill={theme.muted}
              fontFamily={theme.font.mono}
              fontSize={16}
              letterSpacing={1}
            />
          </Layout>
          <Txt
            text={index}
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
            letterSpacing={2}
          />
        </Layout>

        <Layout layout direction="column" gap={22} alignItems="start">
          <AutoText
            keyPrefix="scene-title"
            text={title}
            width={theme.layout.width - theme.layout.safe * 2}
            maxLines={2}
            fontSize={112}
            minFontSize={64}
            lineHeight={1.08}
            fontFamily={theme.font.sans}
            fontWeight={800}
            letterSpacing={-4}
            fill={theme.text}
          />
          <AutoText
            keyPrefix="scene-subtitle"
            text={subtitle}
            width={theme.layout.width - theme.layout.safe * 2}
            maxLines={3}
            fontSize={30}
            minFontSize={20}
            lineHeight={1.45}
            fontFamily={theme.font.sans}
            fill={theme.muted}
          />
        </Layout>

        <Layout layout width="100%" height={430} direction="column">
          {children}
        </Layout>

        <Layout layout direction="row" justifyContent="space-between" alignItems="center">
          <Txt
            text={footer}
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
            letterSpacing={1}
          />
          <Txt
            text={meta}
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
            letterSpacing={1}
          />
        </Layout>
      </Layout>
    </Rect>
  );
}
