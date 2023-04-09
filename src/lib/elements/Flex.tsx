import type { InSimElements } from 'node-insim-react';

import { InSimElement } from '../InSimElement';
import type { UpdatePayload } from '../InSimRenderer';
import type { Container, HostContext } from '../InSimRenderer';

export class Flex extends InSimElement<any, any> {
  constructor(
    props: InSimElements['flex'],
    hostContext: HostContext,
    container: Container,
  ) {
    super(hostContext, container);
  }

  applyData(data: any): void {
    //
  }

  prepareUpdate(oldProps: any, newProps: any): UpdatePayload | null {
    return null;
  }

  remove(): void {
    //
  }
}
