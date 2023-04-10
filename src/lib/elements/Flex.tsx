import type { FlexProps } from '../components';
import { InSimElement } from '../InSimElement';
import type {
  Container,
  HostContext,
  Instance,
  Props,
  TextInstance,
  Type,
  UpdatePayload,
} from '../ReactInSim';

export class Flex extends InSimElement {
  constructor(
    id: number,
    parent: number,
    type: Type,
    props: FlexProps,
    children: Array<Instance | TextInstance>,
    text: string | null,
    context: HostContext,
    container: Container,
  ) {
    super(id, parent, type, children, text, context, container);
  }

  commitMount(): void {
    // noop
  }

  commitUpdate(
    oldProps: Props,
    newProps: Props,
    updatePayload: NonNullable<UpdatePayload<Props>>,
  ): void {
    // noop
  }

  detachDeletedInstance(): void {
    // noop
  }
}
