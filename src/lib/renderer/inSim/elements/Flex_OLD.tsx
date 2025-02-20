import type { FlexProps } from '../../../components';
import { InSimElement_OLD } from '../InSimElement_OLD';
import type { Container_OLD, HostContext, Instance_OLD, Type } from '../types';

export class Flex_OLD extends InSimElement_OLD {
  constructor(
    id: number,
    parent: number,
    type: Type,
    props: FlexProps,
    children: Array<Instance_OLD>,
    context: HostContext,
    container: Container_OLD,
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
