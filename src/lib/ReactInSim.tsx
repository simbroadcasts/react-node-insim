import type { InSim } from 'node-insim';
import type { ReactElement, ReactNode } from 'react';
import type { HostConfig } from 'react-reconciler';
import ReactReconciler from 'react-reconciler';
import {
  ConcurrentRoot,
  DefaultEventPriority,
} from 'react-reconciler/constants';

import type { FlexProps } from './components';
import { Button, Flex } from './elements';
import { InSimContextProvider } from './InSimContext';
import type { InSimElement } from './InSimElement';
import { log } from './logger';

const REACT_ELEMENT_TYPE: symbol = Symbol.for('react.element');
const REACT_FRAGMENT_TYPE: symbol = Symbol.for('react.fragment');

type ReactNodeList = ReactNode | ReactNode[];

type Child = Instance | TextInstance;

type Children = Array<Child>;

export type Container = {
  rootID: string;
  inSim: InSim;
  children: Children;
  pendingChildren: Children;
  renderedButtonIds: Set<number>;
  nextClickId: number;
};

export type Props = Record<string, unknown>;

type TextChild = string | number | null;

type TextChildren = TextChild[] | TextChild;

export type Type = 'btn' | 'flex';

export type Instance = InSimElement;

export type PublicInstance<T extends Instance> = Omit<
  T,
  'commitMount' | 'commitUpdate' | 'detachDeletedInstance'
>;

export type TextInstance = {
  text: string;
  id: number;
  parent: number;
  hidden: boolean;
  context: HostContext;
};

export type HostContext = object;

type CreateRootOptions = InSim;

const NO_CONTEXT = {};
const UPPERCASE_CONTEXT = {};
const UPDATE_SIGNAL = {};
// if (__DEV__) {
//   Object.freeze(NO_CONTEXT);
//   Object.freeze(UPDATE_SIGNAL);
// }

let instanceCounter = 0;
let hostDiffCounter = 0;
let hostUpdateCounter = 0;
let hostCloneCounter = 0;

function appendChildToContainerOrInstance(
  parentInstance: Container | Instance,
  child: Instance | TextInstance,
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
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
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
  child: Instance | TextInstance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index === -1) {
    throw new Error('This child does not exist.');
  }
  parentInstance.children.splice(index, 1);
}

function shouldSetTextContent(type: Type, props: Props): boolean {
  const isTextContent =
    type === 'btn' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number';

  // log('shouldSetTextContent', type, props.children, isTextContent);

  return isTextContent;
}

function computeText(rawText: any, hostContext: any) {
  return hostContext === UPPERCASE_CONTEXT ? rawText.toUpperCase() : rawText;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type UpdatePayload<Props extends Record<string, unknown> = {}> =
  | (keyof Props)[]
  | null;

const hostConfig: HostConfig<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
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
      ? (callback: () => any) =>
          Promise.resolve(null)
            .then(callback)
            .catch((error) => {
              setTimeout(() => {
                throw error;
              });
            })
      : setTimeout,

  // now: Scheduler.unstable_now,

  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  supportsHydration: false,

  getRootHostContext(): HostContext {
    log('getRootHostContext');
    return NO_CONTEXT;
  },

  getChildHostContext(parentHostContext: HostContext, type: Type) {
    log('getChildHostContext', type);
    // if (type === 'offscreen') {
    //   return parentHostContext;
    // }
    // if (type === 'uppercase') {
    //   return UPPERCASE_CONTEXT;
    // }
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
  ): Instance {
    log('createInstance', type);
    // if (__DEV__) {
    //   // The `if` statement here prevents auto-disabling of the safe coercion
    //   // ESLint rule, so we must manually disable it below.
    //   if (shouldSetTextContent(type, props)) {
    //     checkPropStringCoercion(props.children, 'children');
    //   }
    // }

    const id = instanceCounter++;
    const text = shouldSetTextContent(type, props)
      ? computeText((props.children as any) + '', hostContext)
      : null;
    let inst: InSimElement;

    switch (type) {
      case 'btn': {
        inst = new Button(
          id,
          -1,
          type,
          props,
          [],
          text,
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
          text,
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
    Object.defineProperty(inst, 'text', {
      value: inst.text,
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

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
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

  finalizeInitialChildren(
    domElement: Instance,
    type: Type,
    props: Props,
  ): boolean {
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
  ): UpdatePayload<Props> {
    log('prepareUpdate', type, instance.id);

    if (oldProps === null) {
      throw new Error('Should have old props');
    }
    if (newProps === null) {
      throw new Error('Should have new props');
    }

    hostDiffCounter++;

    const hasTextContent = shouldSetTextContent(type, newProps);
    const diff = shallowDiff(oldProps, newProps, hasTextContent);

    if (diff.length === 0) {
      return null;
    }

    return diff;
  },

  shouldSetTextContent,

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): TextInstance {
    log('createTextInstance', text);
    if (hostContext === UPPERCASE_CONTEXT) {
      text = text.toUpperCase();
    }
    const inst = {
      text: text,
      id: instanceCounter++,
      parent: -1,
      hidden: false,
      context: hostContext,
    };
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

    return inst;
  },

  prepareForCommit(): null | object {
    log('prepareForCommit');
    return null;
  },

  resetAfterCommit(): void {
    log('resetAfterCommit');
    log('');
    //
  },

  getCurrentEventPriority() {
    return currentEventPriority;
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

  detachDeletedInstance(node: Instance) {
    log('detachDeletedInstance', node.id);
    node.detachDeletedInstance();
  },

  commitMount(instance: Instance, type: Type, newProps: Props): void {
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

    hostUpdateCounter++;

    instance.commitUpdate(oldProps, newProps, updatePayload);
  },

  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string,
  ): void {
    log('commitTextUpdate', textInstance.id, newText);
    hostUpdateCounter++;
    textInstance.text = computeText(newText, textInstance.context);
  },

  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChild() first argument is not an instance.');
    }
    appendChildToContainerOrInstance(parentInstance, child);
  },

  appendChildToContainer(
    parentInstance: Container,
    child: Instance | TextInstance,
  ): void {
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
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ) {
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  insertInContainerBefore(
    parentInstance: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
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

  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    log('removeChild', { parent: parentInstance.id, child: child.id });
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChild() first argument is not an instance.');
    }
    removeChildFromContainerOrInstance(parentInstance, child);
  },

  removeChildFromContainer(
    parentInstance: Container,
    child: Instance | TextInstance,
  ): void {
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

  hideInstance(instance: Instance): void {
    // instance.hidden = true;
  },

  hideTextInstance(textInstance: TextInstance): void {
    textInstance.hidden = true;
  },

  unhideInstance(instance: Instance, props: Props): void {
    if (!props.hidden) {
      // instance.hidden = false;
    }
  },

  unhideTextInstance(textInstance: TextInstance, text: string): void {
    textInstance.hidden = false;
  },

  resetTextContent(instance: Instance): void {
    // instance.text = null;
  },
};

const InSimRenderer = ReactReconciler(hostConfig);

const rootContainers = new Map();
const roots = new Map();
const DEFAULT_ROOT_ID = '<default>';

const currentEventPriority = DefaultEventPriority;

function childToJSX(child: any, text: any): any {
  if (text !== null) {
    return text;
  }
  if (child === null) {
    return null;
  }
  if (typeof child === 'string') {
    return child;
  }
  if (Array.isArray(child)) {
    if (child.length === 0) {
      return null;
    }
    if (child.length === 1) {
      return childToJSX(child[0], null);
    }
    const children = child.map((c) => childToJSX(c, null));
    if (children.every((c) => typeof c === 'string' || typeof c === 'number')) {
      return children.join('');
    }
    return children;
  }
  if (Array.isArray(child.children)) {
    // This is an instance.
    const instance: Instance = child as any;
    const children = childToJSX(instance.children, instance.text);
    const props = {} as any;
    // if (instance.hidden) {
    //   props.hidden = true;
    // }
    // if (instance.src) {
    //   props.src = instance.src;
    // }
    if (children !== null) {
      props.children = children;
    }
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: instance.type,
      key: null,
      ref: null,
      props: props,
      _owner: null,
      // _store: __DEV__ ? {} : undefined,
    };
  }
  // This is a text instance
  const textInstance: TextInstance = child as any;
  if (textInstance.hidden) {
    return '';
  }
  return textInstance.text;
}

function getChildren(root: any) {
  if (root) {
    return root.children;
  } else {
    return null;
  }
}

function getPendingChildren(root: any) {
  if (root) {
    return root.children;
  } else {
    return null;
  }
}

function getChildrenAsJSX(root: any) {
  const children = childToJSX(getChildren(root), null);
  if (children === null) {
    return null;
  }
  if (Array.isArray(children)) {
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: REACT_FRAGMENT_TYPE,
      key: null,
      ref: null,
      props: { children },
      _owner: null,
      // _store: __DEV__ ? {} : undefined,
    };
  }
  return children;
}

function getPendingChildrenAsJSX(root: any) {
  const children = childToJSX(getChildren(root), null);
  if (children === null) {
    return null;
  }
  if (Array.isArray(children)) {
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: REACT_FRAGMENT_TYPE,
      key: null,
      ref: null,
      props: { children },
      _owner: null,
      // _store: __DEV__ ? {} : undefined,
    };
  }
  return children;
}

function flushSync<R>(fn: () => R): R {
  // if (__DEV__) {
  //   if (NoopRenderer.isAlreadyRendering()) {
  //     console.error(
  //       'flushSync was called from inside a lifecycle method. React cannot ' +
  //       'flush when React is already rendering. Consider moving this call to ' +
  //       'a scheduler task or micro task.',
  //     );
  //   }
  // }
  return InSimRenderer.flushSync(fn);
}

function onRecoverableError(error: any) {
  // TODO: Turn this on once tests are fixed
  // console.error(error);
}

let idCounter = 0;

export const ReactInSim = {
  createRoot(inSim: CreateRootOptions) {
    const rootID = '' + idCounter++;
    const container: Container = {
      rootID,
      inSim,
      pendingChildren: [],
      children: [],
      renderedButtonIds: new Set<number>([]),
      nextClickId: 0,
    };
    rootContainers.set(rootID, container);
    const fiberRoot = InSimRenderer.createContainer(
      container,
      ConcurrentRoot,
      null,
      false,
      false,
      '',
      onRecoverableError,
      null,
    );

    roots.set(rootID, fiberRoot);

    return {
      render(children: ReactNodeList) {
        InSimRenderer.updateContainer(
          <InSimContextProvider inSim={inSim}>{children}</InSimContextProvider>,
          fiberRoot,
          null,
          null,
        );
      },
      getChildren() {
        return getChildren(container);
      },
      getChildrenAsJSX() {
        return getChildrenAsJSX(container);
      },
    };
  },

  getChildrenAsJSX(rootID: string = DEFAULT_ROOT_ID) {
    const container = rootContainers.get(rootID);
    return getChildrenAsJSX(container);
  },

  getPendingChildrenAsJSX(rootID: string = DEFAULT_ROOT_ID) {
    const container = rootContainers.get(rootID);
    return getPendingChildrenAsJSX(container);
  },

  createPortal(
    children: ReactNodeList,
    container: Container,
    key: string | null = null,
  ) {
    return InSimRenderer.createPortal(children, container, null, key);
  },

  startTrackingHostCounters(): void {
    hostDiffCounter = 0;
    hostUpdateCounter = 0;
    hostCloneCounter = 0;
  },

  stopTrackingHostCounters():
    | {
        hostDiffCounter: number;
        hostUpdateCounter: number;
      }
    | {
        hostDiffCounter: number;
        hostCloneCounter: number;
      } {
    const result = {
      hostDiffCounter,
      hostUpdateCounter,
    };
    hostDiffCounter = 0;
    hostUpdateCounter = 0;
    hostCloneCounter = 0;

    return result;
  },

  // expire: Scheduler.unstable_advanceTime,
  //
  // flushExpired(): Array<mixed> {
  //   return Scheduler.unstable_flushExpired();
  // },

  unstable_runWithPriority: InSimRenderer.runWithPriority,

  batchedUpdates: InSimRenderer.batchedUpdates,

  deferredUpdates: InSimRenderer.deferredUpdates,

  discreteUpdates: InSimRenderer.discreteUpdates,

  // idleUpdates<T>(fn: () => T): T {
  //   const prevEventPriority = currentEventPriority;
  //   currentEventPriority = IdleEventPriority;
  //   try {
  //     fn();
  //   } finally {
  //     currentEventPriority = prevEventPriority;
  //   }
  // },

  flushSync,
  flushPassiveEffects: InSimRenderer.flushPassiveEffects,

  // Logs the current state of the tree.
  dumpTree(rootID: string = DEFAULT_ROOT_ID) {
    const root = roots.get(rootID);
    const rootContainer = rootContainers.get(rootID);
    if (!root || !rootContainer) {
      log('Nothing rendered yet.');
      return;
    }

    const bufferedLog: unknown[] = [];
    function log(...args: any[]) {
      bufferedLog.push(...args, '\n');
    }

    function logHostInstances(children: Children, depth: number) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const indent = '  '.repeat(depth);
        if (typeof child.text === 'string') {
          log(indent + '- ' + child.text);
        } else {
          log(indent + '- ' + (child as Instance).type + '#' + child.id);
          logHostInstances((child as Instance).children, depth + 1);
        }
      }
    }
    function logContainer(container: Container, depth: number) {
      log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
      logHostInstances(container.children, depth + 1);
    }

    function logFiber(fiber: any, depth: number) {
      log(
        '  '.repeat(depth) +
          '- ' +
          // need to explicitly coerce Symbol to a string
          (fiber.type ? fiber.type.name || fiber.type.toString() : '[root]'),
        '[' + fiber.childExpirationTime + (fiber.pendingProps ? '*' : '') + ']',
      );
      // if (fiber.updateQueue) {
      //   logUpdateQueue(fiber.updateQueue, depth);
      // }
      // const childInProgress = fiber.progressedChild;
      // if (childInProgress && childInProgress !== fiber.child) {
      //   log(
      //     '  '.repeat(depth + 1) + 'IN PROGRESS: ' + fiber.pendingWorkPriority,
      //   );
      //   logFiber(childInProgress, depth + 1);
      //   if (fiber.child) {
      //     log('  '.repeat(depth + 1) + 'CURRENT');
      //   }
      // } else if (fiber.child && fiber.updateQueue) {
      //   log('  '.repeat(depth + 1) + 'CHILDREN');
      // }
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

export function childrenToString(children?: TextChildren): string {
  if (children === null || children === undefined) {
    return '';
  }

  if (Array.isArray(children)) {
    return children.join('');
  }

  if (typeof children === 'number') {
    return children.toString(10);
  }

  return children;
}
