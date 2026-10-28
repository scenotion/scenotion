import { Layout, Line, Rect, Txt } from "@motion-canvas/2d";
import { t, type MessageKey } from "../i18n";
import { theme } from "../theme";

type NodeSpec = {
  x: number;
  y: number;
  width: number;
  titleKey: MessageKey;
  detailKey: MessageKey;
  accent?: boolean;
};

const nodes: NodeSpec[] = [
  {
    x: -380,
    y: 0,
    width: 260,
    titleKey: "architectureMap.source.title",
    detailKey: "architectureMap.source.detail",
  },
  {
    x: 0,
    y: -90,
    width: 300,
    titleKey: "architectureMap.transform.title",
    detailKey: "architectureMap.transform.detail",
    accent: true,
  },
  {
    x: 380,
    y: 0,
    width: 260,
    titleKey: "architectureMap.render.title",
    detailKey: "architectureMap.render.detail",
  },
];

export function ArchitectureMap() {
  return (
    <Rect
      width={1200}
      height={420}
      fill={theme.surface}
      stroke={theme.border}
      lineWidth={2}
      radius={18}
    >
      <Line
        points={[
          [-250, 0],
          [-150, 0],
          [-150, -90],
          [-150, 0],
          [150, 0],
          [150, 0],
          [250, 0],
        ]}
        stroke={theme.muted}
        lineWidth={2}
      />
      <Line
        points={[
          [-150, -90],
          [-150, 0],
          [150, 0],
        ]}
        stroke={theme.border}
        lineWidth={2}
      />

      {nodes.map((node) => (
        <Rect
          key={node.titleKey}
          x={node.x}
          y={node.y}
          width={node.width}
          height={120}
          fill={node.accent ? "rgba(0, 200, 83, 0.10)" : theme.surfaceRaised}
          stroke={node.accent ? theme.accent : theme.border}
          lineWidth={node.accent ? 2 : 1}
          radius={14}
        >
          <Layout layout
            width={node.width}
            height={120}
            padding={22}
            direction="column"
            justifyContent="center"
            gap={8}
          >
            <Txt
              text={() => t(node.titleKey)}
              fill={node.accent ? theme.accent : theme.text}
              fontFamily={theme.font.sans}
              fontSize={25}
              fontWeight={700}
            />
            <Txt
              text={() => t(node.detailKey)}
              fill={theme.muted}
              fontFamily={theme.font.mono}
              fontSize={16}
            />
          </Layout>
        </Rect>
      ))}

      <Txt
        text={() => t("architectureMap.caption")}
        x={0}
        y={150}
        fill={theme.muted}
        fontFamily={theme.font.mono}
        fontSize={15}
        letterSpacing={1}
      />
    </Rect>
  );
}
