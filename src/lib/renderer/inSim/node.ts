import type Yoga from 'yoga-layout-prebuilt';

export function getAbsolutePosition(
  node: Yoga.YogaNode,
): Pick<
  ReturnType<Yoga.YogaNode['getComputedLayout']>,
  'left' | 'top' | 'width' | 'height'
> {
  let left = 0;
  let top = 0;
  let width: number | null = null;
  let height: number | null = null;

  let currentNode: Yoga.YogaNode | null = node;

  while (currentNode) {
    const layout = currentNode.getComputedLayout();

    if (width === null) {
      width = layout.width;
    }

    if (height === null) {
      height = layout.height;
    }

    left += layout.left;
    top += layout.top;
    currentNode = currentNode.getParent();
  }

  return {
    left,
    top,
    width: width ?? 0,
    height: height ?? 0,
  };
}
