/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import type { InSim } from 'node-insim';
import type { IS_BTN_Data } from 'node-insim/packets';
import type { FunctionComponentElement } from 'react';
import type { HostConfig } from 'react-reconciler';
import Reconciler from 'react-reconciler';

import { Button } from './elements';
import { InSimContextProvider } from './InSimContext';
import type { Children, InSimElements } from './JSX';
import { log } from './logger';

type Type = 'btn';
export type Props<T extends keyof InSimElements = 'btn'> = InSimElements[T];
export type Container = {
  inSim: InSim;
  renderedButtonIds: Set<number>;
};
type Instance = Button;

type TextInstance = string | number;
type SuspenseInstance = any;
type HydratableInstance = any;
type PublicInstance = any;
export type HostContext = {
  nextClickId: number;
};
export type UpdatePayload<T extends keyof InSimElements = 'btn'> = {
  packetProps: IS_BTN_Data;
  inSim: InSim;
};
type _ChildSet = any;
type TimeoutHandle = any;
type NoTimeout = any;

const rootHostContext: HostContext = {
  nextClickId: 0,
};

const hostConfig: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  _ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  supportsMutation: true,
  supportsPersistence: false,
  noTimeout: -1,
  isPrimaryRenderer: true,
  supportsHydration: false,

  createInstance(
    type: Type,
    props: Props,
    rootContainer: Container,
    hostContext: HostContext,
  ): Instance {
    log('createInstance', { type });

    if (type === 'btn') {
      return new Button(props, hostContext, rootContainer);
    }

    throw new Error(`Invalid instance type "${type}"`);
  },

  createTextInstance(text: string): TextInstance {
    return text;
  },

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    log('appendInitialChild', {
      parent: parentInstance.packet.ClickID,
    });
  },

  finalizeInitialChildren(): boolean {
    return false;
  },

  prepareUpdate<T extends Type>(
    instance: Instance,
    type: T,
    oldProps: Props<T>,
    newProps: Props<T>,
  ): UpdatePayload<T> | null {
    log('prepareUpdate');

    switch (type) {
      case 'btn': {
        return instance.prepareUpdate(oldProps, newProps);
      }
    }

    throw new Error(`Invalid instance type "${type}"`);
  },

  shouldSetTextContent(type: Type, props: Props): boolean {
    return (
      typeof props.children === 'number' || typeof props.children === 'string'
    );
  },

  getRootHostContext(rootContainer: Container): HostContext | null {
    log('getRootHostContext');

    return rootHostContext;
  },

  getChildHostContext(parentHostContext: HostContext): HostContext {
    // log('getChildHostContext');
    return parentHostContext;
  },

  getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  },

  prepareForCommit(): Record<string, any> | null {
    // noop
    return null;
  },

  resetAfterCommit(): void {
    // noop
  },

  preparePortalMount(): void {
    // noop
  },

  scheduleTimeout(
    // eslint-disable-next-line no-unused-vars
    fn: (...args: unknown[]) => unknown,
    delay?: number,
  ): TimeoutHandle {
    log('scheduleTimeout');
    log({ fn, delay });
  },

  cancelTimeout(id: TimeoutHandle): void {
    log('cancelTimeout');
    log({ id });
  },

  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    log('appendChild', { parent: parentInstance.packet.ClickID });
    // log({ parentInstance, child });
  },

  appendChildToContainer(
    container: Container,
    child: Instance | TextInstance,
  ): void {
    log('appendChildToContainer', {
      child: child instanceof Button ? child.packet.ClickID : child,
    });
    // log({ container, child });
  },

  insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance | SuspenseInstance,
  ): void {
    log('insertBefore');
    // log({ parentInstance, child, beforeChild });
  },

  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance | SuspenseInstance,
  ): void {
    log('insertInContainerBefore');
    // log({ container, child, beforeChild });
  },

  removeChild(
    parentInstance: Instance,
    child: Instance | TextInstance | SuspenseInstance,
  ): void {
    log('removeChild');
    // log({ parentInstance, child });
  },

  removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance | SuspenseInstance,
  ): void {
    log('removeChildFromContainer', {
      child: child.packet.ClickID,
    });

    if (child instanceof Button) {
      child.remove();
    }
  },

  resetTextContent(instance: Instance): void {
    instance.packet.Text = '';
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string,
  ): void {
    textInstance = newText;
  },

  commitMount(): void {
    // noop
  },

  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
  ): void {
    log('commitUpdate', instance.packet.ClickID);

    switch (type) {
      case 'btn': {
        if (updatePayload === null) {
          return;
        }

        instance.applyData(updatePayload.packetProps);
        return;
      }
    }

    throw new Error(`Invalid instance type "${type}"`);
  },

  hideInstance(instance: Instance): void {
    log('hideInstance');
    // log({ instance });
  },

  hideTextInstance(textInstance: TextInstance): void {
    log('hideTextInstance');
    // log({ textInstance });
  },

  unhideInstance(instance: Instance, props: Props): void {
    log('unhideInstance');
    // log({ instance, props });
  },

  unhideTextInstance(textInstance: TextInstance, text: string): void {
    log('unhideTextInstance');
    // log({ textInstance, text });
  },

  clearContainer(container: Container): void {
    log('clearContainer');
    // log({ container });
  },
  beforeActiveInstanceBlur(): void {
    log('beforeActiveInstanceBlur');
  },
  afterActiveInstanceBlur(): void {
    log('afterActiveInstanceBlur');
  },
  prepareScopeUpdate(scopeInstance: any, instance: any): void {
    log('prepareScopeUpdate');
  },
  getInstanceFromScope(scopeInstance: any) {
    log('getInstanceFromScope');
    return null;
  },
  detachDeletedInstance(node: Instance): void {
    log('detachDeletedInstance');
  },
  getInstanceFromNode(node) {
    log('getInstanceFromNode');
    return null;
  },
  getCurrentEventPriority() {
    log('getCurrentEventPriority');
    return 0;
  },
};

export function childrenAsString(children?: Children | Children[]): string {
  if (children === undefined) {
    return '';
  }

  if (typeof children === 'string') {
    return children;
  }

  if (typeof children === 'number') {
    return children.toString(10);
  }

  if (children.length) {
    return children.join('');
  }

  return '';
}

const reconciler = Reconciler(hostConfig);

export const InSimRenderer = {
  render(component: FunctionComponentElement<unknown>, inSim: InSim) {
    const root = reconciler.createContainer(
      {
        inSim,
        renderedButtonIds: new Set<number>(),
      },
      0,
      null,
      false,
      null,
      '',
      () => {
        //
      },
      null,
    );
    reconciler.updateContainer(
      <InSimContextProvider inSim={inSim}>{component}</InSimContextProvider>,
      root,
      null,
    );
  },
};
