import type { Container, HostContext, UpdatePayload } from './InSimRenderer';
import type { InSimElementProps } from './JSX';

export abstract class InSimElement<
  Props extends InSimElementProps<unknown, unknown>,
  InSimData,
> {
  protected readonly hostContext: HostContext;
  protected readonly container: Container;

  protected constructor(hostContext: HostContext, container: Container) {
    this.hostContext = hostContext;
    this.container = container;
  }

  abstract remove(): void;

  abstract prepareUpdate(
    oldProps: Props,
    newProps: Props,
  ): UpdatePayload | null;

  abstract applyData(data: InSimData): void;
}
