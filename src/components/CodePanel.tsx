import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { theme } from "../theme";

type CodePanelProps = {
  filename: string;
  language: string;
  lines: string[];
  activeLine?: number;
};

function isAccentLine(line: string) {
  return line.startsWith("CLIFF") || line.startsWith("<") || line.startsWith("[");
}

export function CodePanel({
  filename,
  language,
  lines,
  activeLine = 1,
}: CodePanelProps) {
  return (
    <Rect
      width={1200}
      height={420}
      fill={theme.surface}
      stroke={theme.border}
      lineWidth={2}
      radius={18}
    >
      <Layout layout
        width={1200}
        height={420}
        padding={32}
        direction="column"
        gap={0}
      >
        <Layout layout direction="row" justifyContent="space-between" alignItems="center">
          <Layout layout direction="row" gap={14} alignItems="center">
            <Rect width={10} height={10} radius={5} fill={theme.accent} />
            <Txt
              text={filename}
              fill={theme.text}
              fontFamily={theme.font.mono}
              fontSize={18}
            />
          </Layout>
          <Txt
            text={language}
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
          />
        </Layout>

        <Rect width="100%" height={1} fill={theme.border} marginTop={20} marginBottom={20} />

        <Layout layout direction="column" gap={2}>
          {lines.map((line, index) => {
            const active = index === activeLine;
            return (
              <Layout layout
                key={String(index)}
                direction="row"
                gap={16}
                alignItems="center"
                height={34}
              >
                <Rect
                  width={4}
                  height={22}
                  radius={2}
                  fill={active ? theme.accent : null}
                />
                <Txt
                  text={String(index + 1).padStart(2, "0")}
                  width={40}
                  textAlign="right"
                  fill={active ? theme.accent : theme.muted}
                  fontFamily={theme.font.mono}
                  fontSize={18}
                />
                <Txt
                  text={line}
                  fill={isAccentLine(line) ? theme.accent : theme.text}
                  fontFamily={theme.font.mono}
                  fontSize={22}
                />
              </Layout>
            );
          })}
        </Layout>
      </Layout>
    </Rect>
  );
}
