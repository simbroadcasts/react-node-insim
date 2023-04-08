import type { IS_BTC, IS_BTN_Data, IS_BTT } from 'node-insim/packets';
import {
  ButtonFunction,
  ButtonStyle,
  ButtonTextColour,
  IS_BFN,
  IS_BTN,
  PacketType,
  TypeIn,
} from 'node-insim/packets';

import { InSimElement } from './InSimElement';
import type {
  Container,
  HostContext,
  Props,
  UpdatePayload,
} from './InSimRenderer';
import { childrenAsString } from './InSimRenderer';
import type { Children, InSimElementProps } from './JSX';
import { log } from './logger';

export type BtnProps = InSimElementProps<IS_BTN, BtnBaseProps>;

type BtnBaseProps = {
  /** 0 to 240 characters of text */
  children?: Children | Children[];

  /** Connection to display the button (0 = local / 255 = all) */
  UCID?: number;

  /** Width (0 to 200) */
  width: number;

  /** Height (0 to 200) */
  height: number;

  /** Top offset (0 to 200) */
  top: number;

  /** Left offset (0 to 200) */
  left: number;

  variant?: 'transparent' | 'light' | 'dark';
  align?: 'left' | 'right' | 'center';
  color?:
    | 'lightgrey'
    | 'title'
    | 'unselected'
    | 'selected'
    | 'ok'
    | 'cancel'
    | 'textstring'
    | 'unavailable';

  /** If set, the user can click this button to type in text. This is the maximum number of characters to type in (0 to 95) */
  maxTypeInChars?: number;

  /** Initialise dialog with the button's text */
  initializeDialogWithButtonText?: boolean;

  onClick?: (packet: IS_BTC) => void;
  onType?: (packet: IS_BTT) => void;
};

export class Button extends InSimElement<BtnProps, IS_BTN_Data> {
  readonly packet: IS_BTN;
  private onClickListeners: Required<BtnProps>['onClick'][] = [];
  private onTypeListeners: Required<BtnProps>['onType'][] = [];

  constructor(props: Props, hostContext: HostContext, container: Container) {
    super(hostContext, container);

    if (container.renderedButtonIds.size > IS_BTN.MAX_CLICK_ID) {
      throw new Error(
        `Too many buttons. The maximum number of rendered buttons is ${IS_BTN.MAX_CLICK_ID}.`,
      );
    }

    if (
      (props.width === 0 && props.height !== 0) ||
      (props.width !== 0 && props.height === 0)
    ) {
      throw new Error(
        `Invalid button dimensions: W=${props.width} H=${props.height}`,
      );
    }

    const buttonStyle = getUpdatedButtonStyleFromProps(props);
    const clickId = getNextFreeClickId(hostContext, container);
    container.renderedButtonIds.add(clickId);

    const initValueButtonText = props.initializeDialogWithButtonText
      ? TypeIn.INIT_VALUE_BUTTON_TEXT
      : 0;

    const btnPacket = new IS_BTN({
      ReqI: 1,
      ClickID: clickId,
      UCID: props.UCID ?? 0,
      T: props.top,
      L: props.left,
      W: props.width,
      H: props.height,
      Text: childrenAsString(props.children),
      BStyle: buttonStyle,
      TypeIn: props.maxTypeInChars
        ? props.maxTypeInChars + initValueButtonText
        : 0,
    });

    log('add button', clickId, {
      nextClickId: hostContext.nextClickId,
    });

    container.inSim.send(btnPacket);
    this.packet = btnPacket;

    if (props.onClick) {
      this.addOnClickListener(props.onClick);
    }

    if (props.onType) {
      this.addOnTypeListener(props.onType);
    }
  }

  remove() {
    const { packet } = this;
    log('remove button', packet.ClickID);

    const { inSim, renderedButtonIds } = this.container;

    inSim.send(
      new IS_BFN({
        SubT: ButtonFunction.BFN_DEL_BTN,
        ClickID: packet.ClickID,
        UCID: packet.UCID,
      }),
    );

    renderedButtonIds.delete(packet.ClickID);
    this.hostContext.nextClickId = packet.ClickID;

    this.clearOnClickListeners();
    this.clearOnTypeListeners();

    // Remove all click and type listeners when the all buttons are cleared by user
    inSim.on(PacketType.ISP_BFN, (packet) => {
      if (packet.SubT === ButtonFunction.BFN_USER_CLEAR) {
        log(
          `button ${this.packet.ClickID} - user cleared all buttons - clear listeners`,
        );
        this.clearOnClickListeners();
        this.clearOnTypeListeners();
      }
    });
  }

  prepareUpdate(oldProps: Props, newProps: Props): UpdatePayload | null {
    log(`Button ${this.packet.ClickID} - prepare update`);

    const { packet } = this;
    const { inSim } = this.container;

    let visuallyChanged = false;
    let onClickChanged = false;
    let onTypeChanged = false;

    const buttonTextIsEqual =
      childrenAsString(oldProps.children) ===
      childrenAsString(newProps.children);

    if (
      oldProps.UCID === newProps.UCID &&
      oldProps.width === newProps.width &&
      oldProps.height === newProps.height &&
      oldProps.top === newProps.top &&
      oldProps.left === newProps.left &&
      oldProps.variant === newProps.variant &&
      oldProps.align === newProps.align &&
      oldProps.color === newProps.color &&
      buttonTextIsEqual &&
      oldProps.onClick === newProps.onClick &&
      oldProps.onType === newProps.onType
    ) {
      return null;
    }

    if (
      oldProps.UCID !== newProps.UCID ||
      oldProps.width !== newProps.width ||
      oldProps.height !== newProps.height ||
      oldProps.top !== newProps.top ||
      oldProps.left !== newProps.left ||
      oldProps.variant !== newProps.variant ||
      oldProps.align !== newProps.align ||
      oldProps.color !== newProps.color ||
      (oldProps.onClick === undefined && newProps.onClick !== undefined) ||
      (oldProps.onClick !== undefined && newProps.onClick === undefined) ||
      (oldProps.onType === undefined && newProps.onType !== undefined) ||
      (oldProps.onType !== undefined && newProps.onType === undefined)
    ) {
      log(`Button ${packet.ClickID} - visually changed`);
      visuallyChanged = true;
    }

    if (oldProps.onClick !== newProps.onClick) {
      log(`Button ${packet.ClickID} - onClick changed`);
      onClickChanged = true;
    }

    if (oldProps.onType !== newProps.onType) {
      log(`Button ${packet.ClickID} - onType changed`);
      onTypeChanged = true;
    }

    const eventListenersChanged = onClickChanged || onTypeChanged;

    if (onClickChanged) {
      this.clearOnClickListeners();

      if (newProps.onClick) {
        this.addOnClickListener(newProps.onClick);
      }
    }

    if (onTypeChanged) {
      this.clearOnTypeListeners();

      if (newProps.onType) {
        this.addOnTypeListener(newProps.onType);
      }
    }

    // Only onClick or onType changed - no need to update
    if (eventListenersChanged && !visuallyChanged && buttonTextIsEqual) {
      log(
        `Button ${this.packet.ClickID} - only event listeners changed - do not re-render`,
      );
      return null;
    }

    const buttonStyle = getUpdatedButtonStyleFromProps(newProps);

    const packetProps: IS_BTN_Data = {
      ReqI: packet.ReqI,
      ClickID: packet.ClickID,
      Text: childrenAsString(newProps.children),
    };

    if (visuallyChanged) {
      packetProps.T = newProps.top;
      packetProps.L = newProps.left;
      packetProps.W = newProps.width;
      packetProps.H = newProps.height;
      packetProps.BStyle = buttonStyle;
    }

    return {
      packetProps,
      inSim,
    };
  }

  applyData(data: IS_BTN_Data) {
    log(`Button ${this.packet.ClickID} - apply new props`);
    this.container.inSim.send(new IS_BTN(data));
  }

  private addOnClickListener(onClick: (packet: IS_BTC) => void): void {
    const clickListener = (btcPacket: IS_BTC) => {
      if (this.packet.ClickID === btcPacket.ClickID) {
        onClick(btcPacket);
      }
    };

    log(`Button ${this.packet.ClickID} - add onClick listener`);
    this.container.inSim.on(PacketType.ISP_BTC, clickListener);
    this.onClickListeners.push(clickListener);
  }

  private addOnTypeListener(onType: (packet: IS_BTT) => void): void {
    const typeListener = (bttPacket: IS_BTT) => {
      if (this.packet.ClickID === bttPacket.ClickID) {
        onType(bttPacket);
      }
    };

    log(`Button ${this.packet.ClickID} - add onType listener`);
    this.container.inSim.on(PacketType.ISP_BTT, typeListener);
    this.onTypeListeners.push(typeListener);
  }

  private clearOnClickListeners() {
    if (this.onClickListeners && this.onClickListeners.length > 0) {
      log(`Button ${this.packet.ClickID} - remove existing onClick listeners`);
      this.onClickListeners.forEach((listener: (packet: IS_BTC) => void) => {
        log(`Button ${this.packet.ClickID} - remove onClick listener`);
        this.container.inSim.removeListener(PacketType.ISP_BTC, listener);
      });
      this.onClickListeners = [];
    }
  }

  private clearOnTypeListeners() {
    if (this.onTypeListeners && this.onTypeListeners.length > 0) {
      log(`Button ${this.packet.ClickID} - remove existing onType listeners`);
      this.onTypeListeners.forEach((listener: (packet: IS_BTT) => void) => {
        log(`Button ${this.packet.ClickID} - remove onType listener`);
        this.container.inSim.removeListener(PacketType.ISP_BTT, listener);
      });
      this.onTypeListeners = [];
    }
  }
}

function getNextFreeClickId(
  rootHostContext: HostContext,
  container: Container,
) {
  log('getNextClickId');

  const nextId = findFreeId([...container.renderedButtonIds]);
  rootHostContext.nextClickId = nextId;

  return nextId;
}

function findFreeId(array: number[]) {
  const sortedArray = array
    .slice() // Make a copy of the array.
    .sort(function (a, b) {
      return a - b;
    }); // Sort it.
  let previousId = -1;
  for (const element of sortedArray) {
    if (element != previousId + 1) {
      // Found a gap.
      return previousId + 1;
    }
    previousId = element;
  }
  // Found no gaps.
  return previousId + 1;
}

export function getUpdatedButtonStyleFromProps(props: Props): number {
  let buttonStyle = 0;

  if (props.onClick || props.maxTypeInChars) {
    buttonStyle |= ButtonStyle.ISB_CLICK;
  }

  if (props.variant) {
    buttonStyle |= buttonVariantMap[props.variant];
  }

  if (props.align) {
    buttonStyle |= buttonAlignmentMap[props.align];
  }

  if (props.color) {
    buttonStyle |= buttonColorMap[props.color];
  }

  return buttonStyle;
}

const buttonVariantMap: Record<Required<Props>['variant'], ButtonStyle> = {
  dark: ButtonStyle.ISB_DARK,
  light: ButtonStyle.ISB_LIGHT,
  transparent: 0,
};

const buttonAlignmentMap: Record<Required<Props>['align'], ButtonStyle> = {
  left: ButtonStyle.ISB_LEFT,
  center: 0,
  right: ButtonStyle.ISB_RIGHT,
};

const buttonColorMap: Record<Required<Props>['color'], ButtonTextColour> = {
  lightgrey: ButtonTextColour.LIGHT_GREY,
  title: ButtonTextColour.TITLE_COLOUR,
  unselected: ButtonTextColour.UNSELECTED_TEXT,
  selected: ButtonTextColour.SELECTED_TEXT,
  ok: ButtonTextColour.OK,
  cancel: ButtonTextColour.CANCEL,
  textstring: ButtonTextColour.TEXT_STRING,
  unavailable: ButtonTextColour.UNAVAILABLE,
};