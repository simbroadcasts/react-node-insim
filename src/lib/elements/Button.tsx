import type { IS_BTC, IS_BTN_Data, IS_BTT } from 'node-insim/packets';
import { PacketType } from 'node-insim/packets';
import {
  ButtonFunction,
  ButtonStyle,
  ButtonTextColour,
  IS_BFN,
  IS_BTN,
  TypeIn,
} from 'node-insim/packets';

import type { InSimElementProps } from '../InSimElement';
import { InSimElement } from '../InSimElement';
import { log as baseLog } from '../logger';
import type {
  Container,
  HostContext,
  PublicInstance,
  UpdatePayload,
} from '../ReactInSim';
import type { Instance, Type } from '../ReactInSim';
import { childrenToString } from '../ReactInSim';

const log = baseLog.extend('button');

export type ButtonElement = PublicInstance<Button>;

export type ButtonElementProps = InSimElementProps<
  ButtonElement,
  ButtonBaseProps
>;

type Child = string | number;

type ButtonBaseProps = {
  /** 0 to 240 characters of text */
  children?: Child | Child[];

  /** Connection to display the button (0 = local / 255 = all) */
  UCID?: number;

  /** Width (0 to 200) */
  width?: number;

  /** Height (0 to 200) */
  height?: number;

  /** Top offset (0 to 200) */
  top?: number;

  /** Left offset (0 to 200) */
  left?: number;

  /** Background color */
  variant?: 'transparent' | 'light' | 'dark';

  /** Label text alignment */
  align?: 'left' | 'right' | 'center';

  /** Label text color */
  color?:
    | 'lightgrey'
    | 'title'
    | 'unselected'
    | 'selected'
    | 'ok'
    | 'cancel'
    | 'textstring'
    | 'unavailable';
  flex?: number;

  /**
   * If set, the user can click this button to type in text. This is the maximum number of characters to type in (0 to 95)
   */
  maxTypeInChars?: number;

  /** Initialise dialog with the button's text */
  initializeDialogWithButtonText?: boolean;

  /** Sets the caption of the text entry dialog, if enabled by the {@link maxTypeInChars} property */
  caption?: string;

  /** A function to be called when a user clicks the button */
  onClick?: (packet: IS_BTC) => void;

  /**
   * A function to be called when a user enters a value in the button's dialog.
   *
   * {@link maxTypeInChars} must be set to a value greater than 0.
   */
  onType?: (packet: IS_BTT) => void;

  /** Used when user has requested to clear all buttons */
  shouldClearAllButtons?: boolean;
};

const BUTTON_REQUEST_ID = 1;

export class Button extends InSimElement {
  private _packet: IS_BTN = new IS_BTN();
  private onClickListeners: Required<ButtonElementProps>['onClick'][] = [];
  private onTypeListeners: Required<ButtonElementProps>['onType'][] = [];

  constructor(
    id: number,
    parent: number,
    type: Type,
    props: ButtonElementProps,
    children: Array<Instance>,
    context: HostContext,
    container: Container,
  ) {
    super(id, parent, type, children, context, container);

    if (container.renderedButtonIds.size > IS_BTN.MAX_CLICK_ID) {
      throw new Error(
        `Too many buttons. The maximum number of rendered buttons is ${IS_BTN.MAX_CLICK_ID}.`,
      );
    }

    if (props.shouldClearAllButtons) {
      log(`Button ${this.id} - user has hidden all buttons - do not create`);
      return;
    }

    this.checkDimensions(props, { checkWidthAndHeight: true });

    const buttonData = this.getButtonDataFromProps(props);
    this._packet = new IS_BTN(buttonData);

    props.onClick && this.addOnClickListener(props.onClick);
    props.onType && this.addOnTypeListener(props.onType);

    log(`Button ${this.id} - instance created`);
  }

  commitMount(): void {
    const clickId = this.getNextFreeClickId();
    this._packet.ClickID = clickId;

    this.log('send packet');

    this.container.inSim.send(this._packet);
    this.container.renderedButtonIds.add(clickId);
  }

  commitUpdate(
    oldProps: ButtonElementProps,
    newProps: ButtonElementProps,
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): void {
    this.log('update');

    if (newProps.shouldClearAllButtons) {
      this.log(`user has hidden all buttons - do not update`);
      return;
    }

    this.checkDimensions(newProps);

    // Only text changed
    if (changedPropNames.length === 1 && changedPropNames[0] === 'children') {
      this.log(`only text changed`);
      this.container.inSim.send(
        new IS_BTN({
          ReqI: BUTTON_REQUEST_ID,
          ClickID: this._packet.ClickID,
          Text: childrenToString(newProps.children),
          W: 0,
          H: 0,
        }),
      );
      return;
    }

    const updatedButtonData = this.getButtonDataFromProps(newProps);
    this._packet = new IS_BTN(updatedButtonData);

    const onClickChanged = changedPropNames.includes('onClick');
    const onTypeChanged = changedPropNames.includes('onType');

    const eventListenerPropNames: (keyof ButtonElementProps)[] = [];
    onClickChanged && eventListenerPropNames.push('onClick');
    onTypeChanged && eventListenerPropNames.push('onType');

    const onlyEventListenersChanged = changedPropNames.every((prop) =>
      eventListenerPropNames.includes(prop),
    );
    const eventListenersAddedOrRemoved =
      (oldProps.onClick === undefined && newProps.onClick !== undefined) ||
      (oldProps.onClick !== undefined && newProps.onClick === undefined) ||
      (oldProps.onType === undefined && newProps.onType !== undefined) ||
      (oldProps.onType !== undefined && newProps.onType === undefined);

    if (onClickChanged) {
      this.log(`onClick changed`);
      this.clearOnClickListeners();
      newProps.onClick && this.addOnClickListener(newProps.onClick);
    }

    if (onTypeChanged) {
      this.log(`onType changed`);
      this.clearOnTypeListeners();
      newProps.onType && this.addOnTypeListener(newProps.onType);
    }

    if (eventListenersAddedOrRemoved) {
      this.log('event listeners added or removed');
    }

    if (onlyEventListenersChanged && !eventListenersAddedOrRemoved) {
      this.log(`only event listeners changed - do not send a new packet`);
      return;
    }

    this.container.inSim.send(this._packet);
  }

  detachDeletedInstance(): void {
    this.log(`delete`);

    this.container.inSim.send(
      new IS_BFN({
        SubT: ButtonFunction.BFN_DEL_BTN,
        ClickID: this._packet.ClickID,
        UCID: this._packet.UCID,
      }),
    );

    this.container.renderedButtonIds.delete(this._packet.ClickID);
    this.container.nextClickId = this._packet.ClickID;

    this.clearOnClickListeners();
    this.clearOnTypeListeners();
  }

  get packet(): IS_BTN {
    return this._packet;
  }

  private getButtonDataFromProps(props: ButtonElementProps): IS_BTN_Data {
    const buttonStyle = this.getButtonStyleFromProps(props);
    const initValueButtonText = props.initializeDialogWithButtonText
      ? TypeIn.INIT_VALUE_BUTTON_TEXT
      : 0;
    const textString = childrenToString(props.children);
    const buttonText = props.caption
      ? `\0${props.caption}\0${textString}`
      : textString;

    return {
      ReqI: BUTTON_REQUEST_ID,
      ClickID: this._packet?.ClickID ?? 0,
      UCID: props.UCID ?? 0,
      T: props.top ?? 0,
      L: props.left ?? 0,
      W: props.width ?? 0,
      H: props.height ?? 0,
      Text: buttonText,
      BStyle: buttonStyle,
      TypeIn: props.maxTypeInChars
        ? props.maxTypeInChars + initValueButtonText
        : 0,
    };
  }

  private getButtonStyleFromProps(props: ButtonElementProps): number {
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

  private getNextFreeClickId(): number {
    const nextId = findFreeId([...this.container.renderedButtonIds]);
    this.log('next clickId', nextId);
    this.container.nextClickId = nextId;

    return nextId;
  }

  private addOnClickListener(onClick: (packet: IS_BTC) => void): void {
    const onClickListener = (btcPacket: IS_BTC) => {
      if (this._packet.ClickID === btcPacket.ClickID) {
        onClick(btcPacket);
      }
    };

    this.log(`add onClick listener`);
    this.container.inSim.on(PacketType.ISP_BTC, onClickListener);
    this.onClickListeners.push(onClickListener);
  }

  private addOnTypeListener(onType: (packet: IS_BTT) => void): void {
    const onTypeListener = (bttPacket: IS_BTT) => {
      if (this._packet.ClickID === bttPacket.ClickID) {
        onType(bttPacket);
      }
    };

    this.log(`add onType listener`);
    this.container.inSim.on(PacketType.ISP_BTT, onTypeListener);
    this.onTypeListeners.push(onTypeListener);
  }

  private clearOnClickListeners() {
    if (this.onClickListeners && this.onClickListeners.length > 0) {
      this.onClickListeners.forEach((listener: (packet: IS_BTC) => void) => {
        this.log(`remove onClick listener`);
        this.container.inSim.removeListener(PacketType.ISP_BTC, listener);
      });
      this.onClickListeners = [];
    }
  }

  private clearOnTypeListeners() {
    if (this.onTypeListeners && this.onTypeListeners.length > 0) {
      this.onTypeListeners.forEach((listener: (packet: IS_BTT) => void) => {
        this.log(`remove onType listener`);
        this.container.inSim.removeListener(PacketType.ISP_BTT, listener);
      });
      this.onTypeListeners = [];
    }
  }

  private checkDimensions(
    props: ButtonElementProps,
    { checkWidthAndHeight = false }: { checkWidthAndHeight?: boolean } = {},
  ) {
    if (
      ((props.width ?? 0) === 0 && (props.height ?? 0) !== 0) ||
      ((props.width ?? 0) !== 0 && (props.height ?? 0) === 0) ||
      (checkWidthAndHeight &&
        (props.width ?? 0) === 0 &&
        (props.height ?? 0) === 0)
    ) {
      throw new Error(
        `Invalid button dimensions: W=${props.width} H=${props.height}`,
        {
          cause: this,
        },
      );
    }
  }

  private log(...params: unknown[]) {
    log(
      `instance ID ${this.id} (ClickID ${this._packet.ClickID}) -`,
      ...params,
    );
  }
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

const buttonVariantMap: Record<
  Required<ButtonElementProps>['variant'],
  ButtonStyle
> = {
  dark: ButtonStyle.ISB_DARK,
  light: ButtonStyle.ISB_LIGHT,
  transparent: 0,
};

const buttonAlignmentMap: Record<
  Required<ButtonElementProps>['align'],
  ButtonStyle
> = {
  left: ButtonStyle.ISB_LEFT,
  center: 0,
  right: ButtonStyle.ISB_RIGHT,
};

const buttonColorMap: Record<
  Required<ButtonElementProps>['color'],
  ButtonTextColour
> = {
  lightgrey: ButtonTextColour.LIGHT_GREY,
  title: ButtonTextColour.TITLE_COLOUR,
  unselected: ButtonTextColour.UNSELECTED_TEXT,
  selected: ButtonTextColour.SELECTED_TEXT,
  ok: ButtonTextColour.OK,
  cancel: ButtonTextColour.CANCEL,
  textstring: ButtonTextColour.TEXT_STRING,
  unavailable: ButtonTextColour.UNAVAILABLE,
};
