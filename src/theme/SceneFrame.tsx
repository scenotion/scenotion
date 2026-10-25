import { Layout, Rect, Txt } from "@motion-canvas/2d";
import type { Node } from "@motion-canvas/2d";
import { theme } from "./tokens";

type SceneFrameProps = {
  index: string;
  label: string;
  title: string;
  subtitle: string;
  footer: string;
  children?: Node | Node[];
};

export function SceneFrame({
  index,
  label,
  title,
  subtitle,
  footer,
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
              text={"/ " + label}
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
          <Txt
            text={title}
            fill={theme.text}
            fontFamily={theme.font.sans}
            fontSize={112}
            fontWeight={800}
            lineHeight={1.08}
            height={132}
            letterSpacing={-4}
          />
          <Txt
            text={subtitle}
            fill={theme.muted}
            fontFamily={theme.font.sans}
            fontSize={30}
            lineHeight={1.45}
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
            text="MOTION CANVAS / 4K60 READY"
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
