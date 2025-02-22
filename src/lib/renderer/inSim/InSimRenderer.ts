import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';

import { log } from '../../internals/logger';
import { childrenToString } from '../../internals/utils';
import type { ButtonElementProps, FlexElementProps } from './elements';
import { ButtonElement, FlexElement } from './elements';
import type { InSimElement } from './InSimElement';
import applyStyles from './styleProps';
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

  createInstance(type, props, rootContainer, hostContext) {
    log('createInstance', type);

    let instance: InSimElement;

    switch (type) {
      case 'flex': {
        instance = new FlexElement(
          ++instanceCounter,
          props as FlexElementProps,
          hostContext,
          rootContainer,
        );

        break;
      }
      case 'lfs-button': {
        instance = new ButtonElement(
          ++instanceCounter,
          props as ButtonElementProps,
          hostContext,
          rootContainer,
        );
        break;
      }

      default:
        throw new Error(`Invalid instance type: ${type}`);
    }

    return instance;
  },

  appendInitialChild(parentInstance, child) {
    log(
      `appendInitialChild`,
      parentInstance.type,
      child.type,
      child.props.children,
    );

    parentInstance.appendChild(child);
  },

  finalizeInitialChildren(instance, type, props) {
    const b = instance.type === 'lfs-button' || instance.type === 'flex';
    log('finalizeInitialChildren', type, b);
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

  resetAfterCommit(containerInfo: Container): void {
    log('resetAfterCommit');
    log('');

    containerInfo.node.calculateLayout();
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
  },

  commitMount(instance, type: Type, props) {
    log('commitMount', type);

    instance.commitMount(props);
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    log('commitUpdate', type);

    if (oldProps === null) {
      throw new Error('Should have old props');
    }

    instance.commitUpdate(oldProps, newProps, updatePayload);
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

    parentInstance.appendChild(child);
  },

  appendChildToContainer(container, child) {
    log(`appendChildToContainer`, {
      container: container.type,
      child: child.type,
    });

    if (typeof container.id !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'appendChildToContainer() first argument is not a container.',
      );
    }

    if (child.node.getParent()) {
      child.node.getParent()?.removeChild(child.node);
    }

    container.node.insertChild(child.node, container.children.length);

    child.parent = container;
    container.children.push(child);
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
    if (typeof parentInstance.id !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'insertInContainerBefore() first argument is not a container.',
      );
    }
    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  },

  removeChild(parentInstance, child) {
    log('removeChild', {
      child: child.type,
      parent: parentInstance.type,
    });

    parentInstance.removeChild(child);
  },

  removeChildFromContainer(parentInstance, child): void {
    log('removeChildFromContainer', {
      child: child.type,
      container: parentInstance.id,
    });

    if (typeof parentInstance.id !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error(
        'removeChildFromContainer() first argument is not a container.',
      );
    }

    removeChild(parentInstance, child);
  },

  clearContainer(container: Container) {
    log('clearContainer');
    container.children.splice(0);
  },
});

// TODO test this with LFS
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

function removeChild(parent: InSimElement | Container, child: InSimElement) {
  parent.node.removeChild(child.node);
  parent.node.calculateLayout();

  parent.children = parent.children.filter((c) => c !== child);

  child.parent = null;
  child.node.freeRecursive();

  child.detachDeletedInstance();
}
