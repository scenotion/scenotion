import { Layout } from "@motion-canvas/2d";
import type { LayoutProps, Node } from "@motion-canvas/2d";

class ClipViewportNode extends Layout {
  protected override draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.rect(-this.width() / 2, -this.height() / 2, this.width(), this.height());
    context.clip();
    super.draw(context);
    context.restore();
  }
}

type ClipViewportProps = LayoutProps & {
  children?: Node | Node[];
};

export function ClipViewport({ children, ...props }: ClipViewportProps): Node {
  return new ClipViewportNode({ ...props, layout: false, children });
}
