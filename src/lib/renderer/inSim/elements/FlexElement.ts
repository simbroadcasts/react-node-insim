import Yoga from 'yoga-layout-prebuilt';

import type { ButtonChild } from '../../../components/types';
import type { StyleProps } from '../styleProps';
import applyStyles from '../styleProps';
import type { Container, HostContext, PublicInstance } from '../types';
import { type InSimElementProps, InSimElement } from './InSimElement';

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
  ) {
    const node = Yoga.Node.create();
    applyStyles(node, props);

    super(id, null, 'flex', props, [], context, container, node);
  }

  commitMount(): void {
    this.updateAllLayouts();
  }

  commitUpdate(): void {
    this.updateAllLayouts();
  }

  detachDeletedInstance(): void {
    // noop
  }

  updateLayout() {
    this.children.forEach((child) => child.updateLayout());
  }
}
