import type { YogaNode } from 'yoga-layout-prebuilt';

import type { ButtonChild } from '../../../components/types';
import { type InSimElementProps, InSimElement } from '../InSimElement';
import type { StyleProps } from '../styleProps';
import type { Container, HostContext, PublicInstance } from '../types';

export type FlexElementInstance = PublicInstance<FlexElement>;

export type FlexElementProps = InSimElementProps<
  FlexElementInstance,
  FlexElementBaseProps
>;

type FlexElementBaseProps = StyleProps & {
  children: ButtonChild | ButtonChild[];
  backgroundColor?: 'light' | 'dark';
  borderColor?: 'light' | 'dark';
};

export class FlexElement extends InSimElement {
  constructor(
    id: number,
    props: FlexElementProps,
    context: HostContext,
    container: Container,
    node: YogaNode,
  ) {
    super(id, null, 'flex', props, [], context, container, node);
  }

  commitMount(): void {
    const updateChildren = (container: InSimElement) => {
      container.children.forEach((child) => {
        if (child.type === 'flex') {
          updateChildren(child);
        } else if (child.type === 'lfs-button') {
          // TODO is it needed?
          // const { left, top, width, height } = getAbsolutePosition(
          //   child.node,
          //   child.type,
          // );
          //
          // if (this.props.isConnected) {
          //   sendButton(container.container.inSim, {
          //     clickId: child.clickId,
          //     left,
          //     top,
          //     width,
          //     height,
          //     text: childrenToString(child.props.children as any),
          //   });
          //   return;
          // } else {
          //   log(
          //     `commitMount button in flex - do not send button - not connected to InSim`,
          //   );
          // }
        }
      });
    };

    // TODO
    // Background
    // const { left, top, width, height } = getAbsolutePosition(
    //   this.node,
    //   this.type,
    // );
    //
    // if (this.props.isConnected) {
    //
    //
    //
    //   sendButton(instance.container.inSim, {
    //     clickId: ++instanceCounter,
    //     left,
    //     top,
    //     width,
    //     height,
    //     text: '',
    //   });
    // }

    // updateChildren(this);
  }

  commitUpdate(): void {
    // noop
  }

  detachDeletedInstance(): void {
    // noop
  }
}
