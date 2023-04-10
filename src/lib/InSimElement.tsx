import type { InSim } from 'node-insim';

import type {
  Container,
  HostContext,
  Instance,
  Props,
  TextInstance,
  Type,
  UpdatePayload,
} from './ReactInSim';

export abstract class InSimElement {
  readonly id: number;
  parent: number;
  readonly type: Type;
  readonly children: Array<Instance | TextInstance>;
  readonly text: string | null;
  readonly context: HostContext;
  readonly container: Container;

  protected constructor(
    id: number,
    parent: number,
    type: Type,
    children: Array<Instance | TextInstance>,
    text: string | null,
    context: HostContext,
    container: Container,
  ) {
    this.id = id;
    this.parent = parent;
    this.type = type;
    this.children = children;
    this.text = text;
    this.context = context;
    this.container = container;
  }

  abstract commitMount(): void;

  abstract commitUpdate(
    oldProps: Props,
    newProps: Props,
    updatePayload: NonNullable<UpdatePayload<Props>>,
  ): void;

  abstract detachDeletedInstance(): void;
}
