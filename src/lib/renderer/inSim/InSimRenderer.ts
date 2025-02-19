import type { InSim } from 'node-insim';
import {
  ButtonFunction,
  ButtonStyle,
  IS_BFN,
  IS_BTN,
} from 'node-insim/packets';
import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';
import Yoga from 'yoga-layout-prebuilt';

import { log } from '../../internals/logger';
import { childrenToString } from '../../internals/utils';
import type { InSimElement } from './InSimElement';
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
        if (typeof props.width === 'string' || typeof props.width === 'number')
          node.setWidth(props.width);
        if (
          typeof props.height === 'string' ||
          typeof props.height === 'number'
        )
          node.setHeight(props.height);

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
    // TODO
  },

  finalizeInitialChildren(instance, type, props) {
    log('finalizeInitialChildren', type, props);

    return instance.type === 'lfs-button' || instance.type === 'flex';
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
    // instance.detachDeletedInstance();
  },

  commitMount(instance, type: Type, props) {
    log('commitMount', type);

    instance.clickId = ++instanceCounter;

    if (!instance.props.isConnected) {
      log(`do not commit mount - not connected to InSim`);
      return;
    }
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    log('commitUpdate', type, {
      type,
      oldProps,
      newProps,
      updatePayload,
    });
    if (oldProps === null) {
      throw new Error('Should have old props');
    }

    if (!newProps.isConnected) {
      log(`do not commit update - not connected to InSim`);
      return;
    }

    if (
      typeof newProps.width === 'string' ||
      typeof newProps.width === 'number'
    ) {
      instance.node.setWidth(newProps.width);
    }
    if (
      typeof newProps.height === 'string' ||
      typeof newProps.height === 'number'
    ) {
      instance.node.setHeight(newProps.height);
    }

    if (type === 'flex') {
      log('update FLEX');
      // if (
      //   typeof newProps.width === 'string' ||
      //   typeof newProps.width === 'number'
      // ) {
      //   instance.node.setWidth(newProps.width);
      // }
      // if (
      //   typeof newProps.height === 'string' ||
      //   typeof newProps.height === 'number'
      // ) {
      //   instance.node.setHeight(newProps.height);
      // }

      instance.node.calculateLayout();
      log('Flex layout', instance.node.getComputedLayout());

      const updateChildren = (container: InSimElement) => {
        container.children.forEach((child) => {
          child.node.calculateLayout();
          if (child.type === 'flex') {
            updateChildren(child);
          } else if (child.type === 'lfs-button') {
            const { left, top, width, height } = child.node.getComputedLayout();
            log('child button layout', { left, top, width, height });
            sendButton(container.container.inSim, {
              clickId: child.clickId,
              left,
              top,
              width,
              height,
              text: childrenToString(child.props.children as any),
            });
          }
        });
      };
      updateChildren(instance);
      return;
    }
    if (type === 'lfs-button') {
      // if (
      //   typeof newProps.width === 'string' ||
      //   typeof newProps.width === 'number'
      // ) {
      //   instance.node.setWidth(newProps.width);
      // }
      // if (
      //   typeof newProps.height === 'string' ||
      //   typeof newProps.height === 'number'
      // ) {
      //   instance.node.setHeight(newProps.height);
      // }

      let parent = instance.parent;
      while (parent) {
        parent.node.calculateLayout();
        parent = 'parent' in parent ? parent.parent : null;
      }

      instance.node.calculateLayout();
      const { left, top, width, height } = instance.node.getComputedLayout();
      sendButton(instance.container.inSim, {
        clickId: instance.clickId,
        left,
        top,
        width,
        height,
        text: childrenToString(newProps.children as any),
      });
    }
  },

  commitTextUpdate() {
    log('commitTextUpdate');
    throw new Error('Text nodes are not supported.');
  },

  appendChild(parentInstance, child) {
    // TODO why is this not called?
    log('appendChild', {
      parentInstance: parentInstance.type,
      child: child.type,
    });

    if (parentInstance && parentInstance.node && child.node) {
      parentInstance.node.insertChild(
        child.node,
        parentInstance.children.length,
      );
      // parentInstance.children.push(child);
      child.parent = parentInstance;
    }
  },

  appendChildToContainer(container, child) {
    log(`appendChildToContainer`, {
      container: container.type,
      child: child.type,
    });

    container.node.insertChild(child.node, container.children.length);
    child.parent = container;

    if (typeof container.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'appendChildToContainer() first argument is not a container.',
      );
    }

    if (container.type === 'root') {
      container.children.push(child);
      child.parent = container;
    } else if (container.node) {
      container.node.insertChild(child.node, container.node.getChildCount());
    }

    container.node.calculateLayout();

    if (child.type === 'lfs-button') {
      child.node.calculateLayout();
      console.log('lfs button layout', child.node.getComputedLayout());
    } else if (child.type === 'flex') {
      const renderChildren = (parent: InSimElement) => {
        parent.children.forEach((child) => {
          if (child.type === 'flex') {
            child.node.calculateLayout();
            renderChildren(child);
          } else if (child.type === 'lfs-button') {
            child.node.calculateLayout();
            console.log(
              'lfs button in children layout',
              child.node.getComputedLayout(),
            );
          }
        });
      };

      renderChildren(child);
    }
  },

  insertBefore(parentInstance, child, beforeChild) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((parentInstance as any).rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  insertInContainerBefore(parentInstance, child, beforeChild) {
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
    log('removeChild', { parent: parentInstance, child });

    if (parentInstance && parentInstance.node && child.node) {
      parentInstance.node.removeChild(child.node);
      parentInstance.children = parentInstance.children.filter(
        (c) => c !== child,
      );
      child.parent = null;
    }
  },

  removeChildFromContainer(parentInstance, child): void {
    log('removeChildFromContainer', {
      container: parentInstance.rootID,
      child,
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
  return (
    type === 'lfs-button' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number'
  );
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
  log(`create button with ClickID ${clickId}`);
  console.log({ left, top, width, height, text });
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
  log(`elete button with ClickID ${clickId}`);
  inSim.send(
    new IS_BFN({
      ClickID: clickId,
      SubT: ButtonFunction.BFN_DEL_BTN,
    }),
  );
}
