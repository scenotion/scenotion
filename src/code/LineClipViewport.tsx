import { Layout } from "@motion-canvas/2d";
import type { LayoutProps, Node } from "@motion-canvas/2d";

class LineClipViewportNode extends Layout {
  protected override draw(context: CanvasRenderingContext2D): void {
    const height = this.height();
    if (height <= 0) return;

    context.save();
    context.beginPath();
    context.rect(-this.width() / 2, 0, this.width(), height);
    context.clip();
    super.draw(context);
    context.restore();
  }
}

type LineClipViewportProps = LayoutProps & {
  children?: Node | Node[] | false | null | (Node | false | null)[];
};

/**
 * Clips a line from its top edge to its current reveal height.
 *
 * Unlike ClipViewport, the clip origin is not the node center, so a line can be
 * revealed row by row without moving its text.
 */
export function LineClipViewport({
  children,
  ...props
}: LineClipViewportProps): Node {
  return new LineClipViewportNode({
    ...props,
    layout: false,
    children: children as Node | Node[] | undefined,
  });
}

class RangeClipViewportNode extends Layout {
  public clipTop: () => number = () => 0;
  public clipBottom: () => number = () => 0;

  protected override draw(context: CanvasRenderingContext2D): void {
    const top = this.clipTop();
    const bottom = this.clipBottom();
    if (bottom <= top) return;

    context.save();
    context.beginPath();
    context.rect(-this.width() / 2, top, this.width(), bottom - top);
    context.clip();
    super.draw(context);
    context.restore();
  }
}

type RangeClipViewportProps = LayoutProps & {
  top: () => number;
  bottom: () => number;
  children?: Node | Node[] | false | null | (Node | false | null)[];
};

/**
 * Clips children to an absolute vertical range without translating them.
 *
 * Used to keep the outgoing code layer on top while its top edge is wiped away.
 */
export function RangeClipViewport({
  top,
  bottom,
  children,
  ...props
}: RangeClipViewportProps): Node {
  const node = new RangeClipViewportNode({
    ...props,
    layout: false,
    children: children as Node | Node[] | undefined,
  });
  node.clipTop = top;
  node.clipBottom = bottom;
  return node;
}
