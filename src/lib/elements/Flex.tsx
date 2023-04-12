import type { FlexProps } from '../components';
import { InSimElement } from '../InSimElement';
import type { Container, HostContext, Instance, Type } from '../types';

export class Flex extends InSimElement {
  constructor(
    id: number,
    parent: number,
    type: Type,
    props: FlexProps,
    children: Array<Instance>,
    context: HostContext,
    container: Container,
  ) {
    super(id, parent, type, children, context, container);
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
}
