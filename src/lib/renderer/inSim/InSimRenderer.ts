import type { InSim } from 'node-insim';
import {
  ButtonFunction,
  ButtonStyle,
  IS_BFN,
  IS_BTN,
} from 'node-insim/packets';
import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';
import Yoga, { FLEX_DIRECTION_ROW } from 'yoga-layout-prebuilt';

import { log } from '../../internals/logger';
import { childrenToString } from '../../internals/utils';
import type { InSimElement } from './InSimElement';
import applyStyles from './styles';
import type {
  Container,
  HostContext,
  Instance,
  Props,
  TextChildren,
  Type,
  UpdatePayload,
} from './types';

const NO_CONTEXT = {};
let instanceCounter = 0;

const appendToContainerLog = log.extend('appendToContainer');
const mountLog = log.extend('mount');
const updateLog = log.extend('update');

export const InSimRenderer = ReactReconciler<
  Type,
  Props,
  Container,
  Instance,
  never,
  never,
  never,
  Instance,
  HostContext,
  UpdatePayload<Props>,
  never,
  NodeJS.Timeout,
  number
>({
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

  getRootHostContext() {
    return NO_CONTEXT;
  },

  getChildHostContext() {
    return NO_CONTEXT;
  },

  getPublicInstance(instance) {
    log('getPublicInstance', instance.type);

    return instance;
  },

  createInstance(type, props, rootContainerInstance, hostContext) {
    log('createInstance', type);

    let inst: InSimElement;

    switch (type) {
      case 'flex':
      case 'lfs-button': {
        const node = Yoga.Node.create();

        applyStyles(node, props);

        inst = {
          clickId: 0,
          type,
          props,
          context: hostContext,
          container: rootContainerInstance,
          node,
          parent: null,
          children: [],
        };
        break;
      }

      default:
        throw new Error(`Invalid instance type: ${type}`);
    }

    return inst;
  },

  appendInitialChild(parentInstance, child) {
    log(
      `appendInitialChild`,
      parentInstance.type,
      child.type,
      child.props.children,
    );

    parentInstance.node.insertChild(child.node, parentInstance.children.length);
    child.parent = parentInstance;
    parentInstance.children.push(child);
    parentInstance.container.node.calculateLayout();
  },

  finalizeInitialChildren(instance, type, props) {
    const b = instance.type === 'lfs-button' || instance.type === 'flex';
    log('finalizeInitialChildren', b, type, props);
    return b;
  },

  prepareUpdate(instance, type, oldProps, newProps) {
    log('prepareUpdate', type);

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

  detachDeletedInstance(instance) {
    log('detachDeletedInstance', instance.type);

    // TODO remove from parent?
    // instance.detachDeletedInstance();
  },

  commitMount(instance, type: Type, props) {
    mountLog('commitMount', type);

    mountLog(
      'instance parent node',
      instance.node.getParent()?.getComputedLayout(),
    );

    mountLog(
      'CURRENT LAYOUT',
      instance.type,
      instance.node.getComputedLayout(),
    );
    instance.clickId = ++instanceCounter;

    if (type === 'flex') {
      const updateChildren = (container: InSimElement) => {
        container.children.forEach((child) => {
          if (child.type === 'flex') {
            updateChildren(child);
          } else if (child.type === 'lfs-button') {
            const { left, top, width, height } = child.node.getComputedLayout();

            if (instance.props.isConnected) {
              sendButton(container.container.inSim, {
                clickId: child.clickId,
                left,
                top,
                width,
                height,
                text: childrenToString(child.props.children as any),
              });
              return;
            } else {
              log(
                `commitMount button in flex - do not send button - not connected to InSim`,
              );
            }
          }
        });
      };
      updateChildren(instance);

      return;
    }
    if (type === 'lfs-button') {
      const { left, top, width, height } = instance.node.getComputedLayout();

      if (instance.props.isConnected) {
        sendButton(instance.container.inSim, {
          clickId: instance.clickId,
          left,
          top,
          width,
          height,
          text: childrenToString(props.children as any),
        });
      } else {
        mountLog(`do not send button - not connected to InSim`);
      }
    }
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    updateLog('commitUpdate', type, {
      type,
      oldProps,
      newProps,
      updatePayload,
    });
    if (oldProps === null) {
      throw new Error('Should have old props');
    }

    updateLog(
      'CURRENT LAYOUT',
      instance.type,
      instance.node.getComputedLayout(),
    );
    updateLog('new props', newProps);

    applyStyles(instance.node, newProps);

    instance.container.node.calculateLayout();
    updateLog('NEW LAYOUT', instance.type, instance.node.getComputedLayout());

    if (type === 'flex') {
      // instance.node.calculateLayout();

      const updateChildren = (container: InSimElement) => {
        container.children.forEach((child) => {
          if (child.type === 'flex') {
            updateChildren(child);
          } else if (child.type === 'lfs-button') {
            const { left, top, width, height } = child.node.getComputedLayout();

            if (newProps.isConnected) {
              sendButton(container.container.inSim, {
                clickId: child.clickId,
                left,
                top,
                width,
                height,
                text: childrenToString(child.props.children as any),
              });
              return;
            } else {
              updateLog(
                `button in flex - do not send button - not connected to InSim`,
              );
            }
          }
        });
      };
      updateChildren(instance);
      return;
    }

    if (type === 'lfs-button') {
      updateLog(
        'instance node position type',
        instance.node.getParent()?.getWidth(),
        instance.node.getParent()?.getHeight(),
      );

      const { left, top, width, height } = instance.node.getComputedLayout();

      if (newProps.isConnected) {
        sendButton(instance.container.inSim, {
          clickId: instance.clickId,
          left,
          top,
          width,
          height,
          text: childrenToString(newProps.children as any),
        });
        return;
      } else {
        updateLog(`button - do not send button - not connected to InSim`);
      }
    }
  },

  commitTextUpdate() {
    log('commitTextUpdate');
    throw new Error('Text nodes are not supported.');
  },

  appendChild(parentInstance, child) {
    log('appendChild', {
      parentInstance: parentInstance.type,
      child: child.type,
    });

    parentInstance.node.insertChild(child.node, parentInstance.children.length);
    parentInstance.children.push(child);
    child.parent = parentInstance;

    parentInstance.container.node.calculateLayout();
  },

  appendChildToContainer(container, child) {
    appendToContainerLog(`appendChildToContainer`, {
      container: container.type,
      child: child.type,
    });

    if (typeof container.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'appendChildToContainer() first argument is not a container.',
      );
    }

    appendToContainerLog('child node', child.type, child.node.getHeight());
    const pos = container.children.length;
    appendToContainerLog('insert child at', pos);

    container.node.insertChild(child.node, pos);
    child.parent = container;
    container.children.push(child);
    container.node.calculateLayout();

    appendToContainerLog('get computed layout', child.node.getComputedLayout());
  },

  insertBefore(parentInstance, child, beforeChild) {
    log(`insertBefore`, {
      parentInstance: parentInstance.type,
      child: child.type,
      beforeChild: beforeChild.type,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  insertInContainerBefore(parentInstance, child, beforeChild) {
    log(`insertInContainerBefore`, {
      parentInstance: parentInstance.type,
      child: child.type,
      beforeChild: beforeChild.type,
    });
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'insertInContainerBefore() first argument is not a container.',
      );
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  removeChild(parentInstance, child) {
    log('removeChild', { parent: parentInstance.type, child: child.type });

    if (parentInstance && parentInstance.node && child.node) {
      parentInstance.node.removeChild(child.node);
      parentInstance.children = parentInstance.children.filter(
        (c) => c !== child,
      );
      child.parent = null;
      parentInstance.container.node.calculateLayout();
    }
  },

  removeChildFromContainer(parentInstance, child): void {
    log('removeChildFromContainer', {
      container: parentInstance.rootID,
      child: child.type,
    });
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'removeChildFromContainer() first argument is not a container.',
      );
    }

    deleteButton(child.container.inSim, child.clickId);
  },

  clearContainer(container: Container) {
    log('clearContainer');
    container.children.splice(0);
  },
});

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

function shouldSetTextContent(type: Type, props: Props): boolean {
  const b =
    type === 'lfs-button' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number';

  log('shouldSetTextContent', type, b);

  return b;
}

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

function sendButton(
  inSim: InSim,
  {
    clickId,
    left,
    top,
    width,
    height,
    text,
  }: {
    clickId: number; // TODO auto-generate
    left: number;
    top: number;
    width: number;
    height: number;
    text: string;
  },
) {
  log(`create button with ClickID ${clickId}`, {
    left,
    top,
    width,
    height,
    text,
  });
  inSim.send(
    new IS_BTN({
      ClickID: clickId,
      ReqI: 1,
      L: left,
      T: top,
      W: width,
      H: height,
      BStyle: ButtonStyle.ISB_DARK,
      Text: childrenToString(text),
    }),
  );
}

function deleteButton(
  inSim: InSim,
  clickId: number, // TODO auto-generate
) {
  log(`delete button with ClickID ${clickId}`);
  inSim.send(
    new IS_BFN({
      ClickID: clickId,
      SubT: ButtonFunction.BFN_DEL_BTN,
    }),
  );
}
