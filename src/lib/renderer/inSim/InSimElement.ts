import type { YogaNode } from 'yoga-layout-prebuilt';

import type { Children, Container, HostContext, Props, Type } from './types';

export type InSimElement = {
  parent: InSimElement | Container | null;
  readonly type: Type;
  props: Props;
  children: Children;
  readonly context: HostContext;
  readonly container: Container;
  readonly node: YogaNode;
  clickId: number;
};
