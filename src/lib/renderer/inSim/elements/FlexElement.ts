import type { YogaNode } from 'yoga-layout-prebuilt';

import type { ButtonChild } from '../../../components/types';
import { type InSimElementProps, InSimElement } from '../InSimElement';
import type { StyleProps } from '../styleProps';
import type { Container, HostContext, PublicInstance } from '../types';

export type FlexElementInstance = PublicInstance<FlexElement>;

export type FlexElementProps = InSimElementProps<
  FlexElementInstance,
  FlexElementBaseProps
>;

type FlexElementBaseProps = StyleProps & {
  children: ButtonChild | ButtonChild[];
  backgroundColor?: 'light' | 'dark';
  borderColor?: 'light' | 'dark';
};

export class FlexElement extends InSimElement {
  constructor(
    id: number,
    props: FlexElementProps,
    context: HostContext,
    container: Container,
    node: YogaNode,
  ) {
    super(id, null, 'flex', props, [], context, container, node);
  }

  commitMount(): void {
    // noop
  }

  commitUpdate(): void {
    // noop
  }

  detachDeletedInstance(): void {
    // noop
  }

  updateLayout() {
    // noop
  }
}
