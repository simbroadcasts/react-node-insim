import type { Key, Ref } from 'react';
import type { YogaNode } from 'yoga-layout-prebuilt';

import type {
  Children,
  Container,
  HostContext,
  Props,
  Type,
  UpdatePayload,
} from './types';

export type InSimElementProps<PublicInstance, Props> = Props & {
  ref?: Ref<PublicInstance>;
  key?: Key;
  shouldClearAllButtons?: boolean;
  isConnected?: boolean;
};

export abstract class InSimElement {
  readonly id: number;
  parent: InSimElement | Container | null;
  readonly type: Type;
  props: Props;
  children: Children;
  readonly context: HostContext;
  readonly container: Container;
  readonly node: YogaNode;

  protected constructor(
    id: number,
    parent: InSimElement | Container | null,
    type: Type,
    props: Props,
    children: Children,
    context: HostContext,
    container: Container,
    node: YogaNode,
  ) {
    this.id = id;
    this.parent = parent;
    this.type = type;
    this.props = props;
    this.children = children;
    this.context = context;
    this.container = container;
    this.node = node;
  }

  abstract commitMount(props: Props): void;

  abstract commitUpdate(
    oldProps: Props,
    newProps: Props,
    updatePayload: NonNullable<UpdatePayload<Props>>,
  ): void;

  abstract detachDeletedInstance(): void;

  abstract updateLayout(): void;
}
