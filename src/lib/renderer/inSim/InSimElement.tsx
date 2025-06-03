import type { Key, Ref } from 'react';

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
  UCIDsWithClearedButtons?: number[];
  isConnected?: boolean;
};

export abstract class InSimElement {
  readonly id: number;
  parent: number;
  readonly type: Type;
  readonly children: Children;
  readonly context: HostContext;
  readonly container: Container;

  protected constructor(
    id: number,
    parent: number,
    type: Type,
    children: Children,
    context: HostContext,
    container: Container,
  ) {
    this.id = id;
    this.parent = parent;
    this.type = type;
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
}
