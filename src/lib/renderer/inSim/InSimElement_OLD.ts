import type { Key, Ref } from 'react';

import type {
  Children_OLD,
  Container_OLD,
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

export abstract class InSimElement_OLD {
  readonly id: number;
  parent: number;
  readonly type: Type;
  readonly children: Children_OLD;
  readonly context: HostContext;
  readonly container: Container_OLD;

  protected constructor(
    id: number,
    parent: number,
    type: Type,
    children: Children_OLD,
    context: HostContext,
    container: Container_OLD,
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
