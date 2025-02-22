import type { Key, Ref } from 'react';
import type { YogaNode } from 'yoga-layout-prebuilt';

import type {
  Children,
  Container,
  HostContext,
  InSimElementType,
  Props,
  UpdatePayload,
} from '../types';
import { BaseElement } from './BaseElement';

export type InSimElementProps<PublicInstance, Props> = Props & {
  ref?: Ref<PublicInstance>;
  key?: Key;
  shouldClearAllButtons?: boolean;
  isConnected?: boolean;
};

export abstract class InSimElement extends BaseElement {
  readonly id: number;
  parent: InSimElement | Container | null;
  props: Props;
  readonly context: HostContext;
  readonly container: Container;

  protected constructor(
    id: number,
    parent: InSimElement | Container | null,
    type: InSimElementType,
    props: Props,
    children: Children,
    context: HostContext,
    container: Container,
    node: YogaNode,
  ) {
    super(type, node);

    this.id = id;
    this.parent = parent;
    this.props = props;
    this.children = children;
    this.context = context;
    this.container = container;
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
