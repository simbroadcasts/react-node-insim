import type { InSim } from 'node-insim';
import { PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import type { Fiber, HostConfig, OpaqueRoot } from 'react-reconciler';
import ReactReconciler from 'react-reconciler';
import {
  ConcurrentRoot,
  DefaultEventPriority,
} from 'react-reconciler/constants';

import type { FlexProps } from './components';
import type { ButtonElementProps } from './elements';
import { Button, Flex } from './elements';
import type { InSimElement } from './InSimElement';
import { InSimContextProvider } from './internals/InSimContext';
import { log } from './internals/logger';
import { childrenToString } from './internals/utils';
import type {
  Container,
  HostContext,
  Instance,
  Props,
  PublicInstance,
  TextChildren,
  Type,
  UpdatePayload,
} from './types';

type CreateRootOptions = {
  appendButtonIDs?: boolean;
};

const NO_CONTEXT = {};

let instanceCounter = 0;

function appendChildToContainerOrInstance(
  parentInstance: Container | Instance,
  child: Instance,
): void {
  const prevParent = child.parent;
  if (prevParent !== -1 && prevParent !== (parentInstance as Instance).id) {
    throw new Error('Reparenting is not allowed');
  }
  child.parent = (parentInstance as Instance).id;
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  parentInstance.children.push(child);
}

function insertInContainerOrInstanceBefore(
  parentInstance: Container | Instance,
  child: Instance,
  beforeChild: Instance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }
  const beforeIndex = parentInstance.children.indexOf(beforeChild);
  if (beforeIndex === -1) {
    throw new Error('This child does not exist.');
  }
  parentInstance.children.splice(beforeIndex, 0, child);
}

function removeChildFromContainerOrInstance(
  parentInstance: Container | Instance,
  child: Instance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index === -1) {
    throw new Error('This child does not exist.');
  }
  parentInstance.children.splice(index, 1);
}

function shouldSetTextContent(type: Type, props: Props): boolean {
  return (
    type === 'btn' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number'
  );
}

const hostConfig: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  never,
  never,
  never,
  PublicInstance<Instance>,
  HostContext,
  UpdatePayload<Props>,
  never,
  NodeJS.Timeout,
  number
> = {
  supportsMutation: true,
  supportsPersistence: false,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  supportsMicrotasks: true,
  scheduleMicrotask:
    typeof queueMicrotask === 'function'
      ? queueMicrotask
      : typeof Promise !== 'undefined'
      ? (callback: () => unknown) =>
          Promise.resolve(null)
            .then(callback)
            .catch((error) => {
              setTimeout(() => {
                throw error;
              });
            })
      : setTimeout,

  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  supportsHydration: false,

  getRootHostContext(): HostContext {
    log('getRootHostContext');
    return NO_CONTEXT;
  },

  getChildHostContext(parentHostContext: HostContext, type: Type) {
    log('getChildHostContext', type);
    return NO_CONTEXT;
  },

  getPublicInstance(instance: Instance): PublicInstance<Instance> {
    log('getPublicInstance', instance.type, instance.id);

    const clone: Instance = Object.assign(
      Object.create(Object.getPrototypeOf(instance)),
      instance,
    );

    Object.defineProperty(clone, 'commitMount', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: undefined,
    });

    Object.defineProperty(clone, 'commitUpdate', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: undefined,
    });

    Object.defineProperty(clone, 'detachDeletedInstance', {
      enumerable: false,
      writable: false,
      configurable: false,
      value: undefined,
    });

    return clone;
  },

  createInstance(
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: object,
  ) {
    log('createInstance', type);

    const id = instanceCounter++;
    let inst: InSimElement;

    switch (type) {
      case 'btn': {
        inst = new Button(
          id,
          -1,
          type,
          props as ButtonElementProps,
          hostContext,
          rootContainerInstance,
        );
        break;
      }

      case 'flex': {
        inst = new Flex(
          id,
          -1,
          type,
          props as FlexProps,
          [],
          hostContext,
          rootContainerInstance,
        );
        break;
      }

      default:
        throw new Error(`Invalid instance type: ${type}`);
    }

    // Hide from unit tests
    Object.defineProperty(inst, 'id', { value: inst.id, enumerable: false });
    Object.defineProperty(inst, 'parent', {
      value: inst.parent,
      enumerable: false,
    });
    Object.defineProperty(inst, 'context', {
      value: inst.context,
      enumerable: false,
    });
    Object.defineProperty(inst, 'fiber', {
      value: internalInstanceHandle,
      enumerable: false,
    });

    return inst;
  },

  appendInitialChild(parentInstance: Instance, child: Instance): void {
    log('appendInitialChild', {
      parent: parentInstance.type,
      child,
    });
    const prevParent = child.parent;
    if (prevParent !== -1 && prevParent !== parentInstance.id) {
      throw new Error('Reparenting is not allowed');
    }
    child.parent = parentInstance.id;
    parentInstance.children.push(child);
  },

  finalizeInitialChildren(domElement: Instance, type: Type, props: Props) {
    log('finalizeInitialChildren', type, domElement.id, props);

    if (domElement.type === 'btn') {
      return true;
    }

    return false;
  },

  prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
  ) {
    log('prepareUpdate', type, instance.id);

    if (oldProps === null) {
      throw new Error('Should have old props');
    }
    if (newProps === null) {
      throw new Error('Should have new props');
    }

    const hasTextContent = shouldSetTextContent(type, newProps);
    const diff = shallowDiff(oldProps, newProps, hasTextContent);

    if (diff.length === 0) {
      return null;
    }

    return diff;
  },

  shouldSetTextContent,

  createTextInstance(text: string) {
    log('createTextInstance', text);
    throw new Error('Text nodes are not supported.');
  },

  prepareForCommit(): null | object {
    log('prepareForCommit');
    return null;
  },

  resetAfterCommit(): void {
    log('resetAfterCommit');
    log('');
  },

  getCurrentEventPriority() {
    return DefaultEventPriority;
  },

  getInstanceFromNode() {
    throw new Error('Not yet implemented.');
  },

  beforeActiveInstanceBlur() {
    // NO-OP
  },

  afterActiveInstanceBlur() {
    // NO-OP
  },

  preparePortalMount() {
    // NO-OP
  },

  prepareScopeUpdate() {
    //
  },

  getInstanceFromScope() {
    throw new Error('Not yet implemented.');
  },

  detachDeletedInstance(instance: Instance) {
    log('detachDeletedInstance', instance.id);
    instance.detachDeletedInstance();
  },

  commitMount(instance: Instance, type: Type): void {
    log('commitMount', type, instance.id);
    instance.commitMount();
  },

  commitUpdate(
    instance: Instance,
    updatePayload: NonNullable<UpdatePayload>,
    type: Type,
    oldProps: Props,
    newProps: Props,
  ): void {
    log('commitUpdate', type, instance.id, { updatePayload });
    if (oldProps === null) {
      throw new Error('Should have old props');
    }

    instance.commitUpdate(oldProps, newProps, updatePayload);
  },

  commitTextUpdate(): void {
    log('commitTextUpdate');
    throw new Error('Text nodes are not supported.');
  },

  appendChild(parentInstance: Instance, child: Instance): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChild() first argument is not an instance.');
    }
    appendChildToContainerOrInstance(parentInstance, child);
  },

  appendChildToContainer(parentInstance: Container, child: Instance): void {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'appendChildToContainer() first argument is not a container.',
      );
    }
    appendChildToContainerOrInstance(parentInstance, child);
  },

  insertBefore(
    parentInstance: Instance,
    child: Instance,
    beforeChild: Instance,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  insertInContainerBefore(
    parentInstance: Container,
    child: Instance,
    beforeChild: Instance,
  ) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'insertInContainerBefore() first argument is not a container.',
      );
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  removeChild(parentInstance: Instance, child: Instance): void {
    log('removeChild', { parent: parentInstance.id, child: child.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChild() first argument is not an instance.');
    }
    removeChildFromContainerOrInstance(parentInstance, child);
  },

  removeChildFromContainer(parentInstance: Container, child: Instance): void {
    log('removeChildFromContainer', {
      container: parentInstance.rootID,
      child: child.id,
    });
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'removeChildFromContainer() first argument is not a container.',
      );
    }
    removeChildFromContainerOrInstance(parentInstance, child);
  },

  clearContainer(container: Container): void {
    log('clearContainer');
    container.children.splice(0);
  },
};

const InSimRenderer = ReactReconciler(hostConfig);

const rootContainers = new Map<string, Container>();
const roots = new Map<string, OpaqueRoot>();
const DEFAULT_ROOT_ID = '<default>';

let idCounter = 0;

export const ReactInSim = {
  createRoot(
    inSim: InSim,
    { appendButtonIDs = false }: CreateRootOptions = {},
  ) {
    const rootID = '' + idCounter++;
    const container: Container = {
      rootID,
      inSim,
      pendingChildren: [],
      children: [],
      buttonUCIDsByClickID: [],
      appendButtonIDs,
    };
    rootContainers.set(rootID, container);
    const fiberRoot = InSimRenderer.createContainer(
      container,
      ConcurrentRoot,
      null,
      false,
      false,
      '',
      function (error: unknown) {
        console.error(error);
      },
      null,
    );

    roots.set(rootID, fiberRoot);

    inSim.on(PacketType.ISP_CNL, (packet) => {
      container.buttonUCIDsByClickID.forEach((ucIds, clickID) => {
        if (ucIds.has(packet.UCID)) {
          log(`removing UCID ${packet.UCID} from clickID ${clickID}`);
          ucIds.delete(packet.UCID);
        }
      });
    });

    return {
      render(children: ReactNode | ReactNode[]) {
        InSimRenderer.updateContainer(
          <InSimContextProvider inSim={inSim}>{children}</InSimContextProvider>,
          fiberRoot,
          null,
          null,
        );
      },
    };
  },

  /** Logs the current state of the tree. */
  dumpTree(rootID: string = DEFAULT_ROOT_ID) {
    const root = roots.get(rootID);
    const rootContainer = rootContainers.get(rootID);
    if (!root || !rootContainer) {
      log('Nothing rendered yet.');
      return;
    }

    const bufferedLog: unknown[] = [];
    function log(...args: unknown[]) {
      bufferedLog.push(...args, '\n');
    }

    function logHostInstances(children: Instance[], depth: number) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const indent = '  '.repeat(depth);
        log(indent + '- ' + (child as Instance).type + '#' + child.id);
        logHostInstances((child as Instance).children, depth + 1);
      }
    }
    function logContainer(container: Container, depth: number) {
      log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
      logHostInstances(container.children, depth + 1);
    }

    function logFiber(fiber: Fiber, depth: number) {
      log(
        '  '.repeat(depth) +
          '- ' +
          // need to explicitly coerce Symbol to a string
          (fiber.type ? fiber.type.name || fiber.type.toString() : '[root]'),
        '[' + (fiber.pendingProps ? '*' : '') + ']',
      );
      if (fiber.child) {
        logFiber(fiber.child, depth + 1);
      }
      if (fiber.sibling) {
        logFiber(fiber.sibling, depth);
      }
    }

    log('HOST INSTANCES:');
    logContainer(rootContainer, 0);
    log('FIBERS:');
    logFiber(root.current, 0);

    log(...bufferedLog);
  },

  getRoot(rootID: string = DEFAULT_ROOT_ID) {
    return roots.get(rootID);
  },
};

function shallowDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  hasTextContent: boolean,
): string[] {
  const uniqueProps = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  return Array.from(uniqueProps).filter((propName) => {
    if (propName === 'children' && hasTextContent) {
      const oldChildren = childrenToString(oldObj.children as TextChildren);
      const newChildren = childrenToString(newObj.children as TextChildren);

      return oldChildren !== newChildren;
    }

    return oldObj[propName] !== newObj[propName];
  });
}
