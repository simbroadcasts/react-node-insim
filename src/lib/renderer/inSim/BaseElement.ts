import type { YogaNode } from 'yoga-layout-prebuilt';

import type { InSimElement } from './InSimElement';
import type { Children, Type } from './types';

export abstract class BaseElement {
  readonly type: Type | 'root';
  children: Children;
  readonly node: YogaNode;

  protected constructor(type: Type | 'root', node: YogaNode) {
    this.type = type;
    this.children = [];
    this.node = node;
  }

  appendChild(child: InSimElement) {
    if (child.node.getParent()) {
      child.node.getParent()?.removeChild(child.node);
    }

    this.node.insertChild(child.node, this.node.getChildCount());

    this.updateAllLayouts();

    this.children.push(child);
  }

  removeChild(child: InSimElement) {
    this.node.removeChild(child.node);
    this.node.calculateLayout();

    this.children = this.children.filter((c) => c !== child);

    child.parent = null;
    child.node.freeRecursive();

    child.detachDeletedInstance();
  }

  updateAllLayouts() {
    this.node.calculateLayout();
    this.children.forEach((child) => child.updateLayout());
  }
}
