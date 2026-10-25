import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { theme } from "../theme";

const values = [42, 78, 35, 96, 58, 71, 24, 88];
const active = 3;

export function AlgorithmBars() {
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
        padding={40}
        direction="column"
        justifyContent="space-between"
      >
        <Layout layout direction="row" justifyContent="space-between" alignItems="center">
          <Txt
            text="array / active index"
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
            letterSpacing={1}
          />
          <Txt
            text="O(n log n)"
            fill={theme.accent}
            fontFamily={theme.font.mono}
            fontSize={18}
          />
        </Layout>

        <Layout layout
          width="100%"
          height={250}
          direction="row"
          alignItems="end"
          justifyContent="center"
          gap={24}
        >
          {values.map((value, index) => (
            <Layout layout
              key={String(index)}
              direction="column"
              alignItems="center"
              gap={12}
            >
              <Rect
                width={64}
                height={value * 2.2}
                radius={8}
                fill={index === active ? theme.accent : theme.surfaceRaised}
                stroke={index === active ? theme.accent : theme.border}
                lineWidth={1}
              />
              <Txt
                text={String(value)}
                fill={index === active ? theme.accent : theme.muted}
                fontFamily={theme.font.mono}
                fontSize={16}
              />
            </Layout>
          ))}
        </Layout>

        <Txt
          text="visualization layer / deterministic trace goes here"
          fill={theme.muted}
          fontFamily={theme.font.mono}
          fontSize={15}
          letterSpacing={1}
        />
      </Layout>
    </Rect>
  );
}
