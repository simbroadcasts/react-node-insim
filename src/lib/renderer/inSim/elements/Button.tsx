import type { InSim } from 'node-insim';
import type { IS_BTC, IS_BTN_Data, IS_BTT, IS_NCN } from 'node-insim/packets';
import {
  ButtonFunction,
  ButtonStyle,
  ButtonTextColour,
  IS_BFN,
  IS_BTN,
  PacketType,
  TypeIn,
} from 'node-insim/packets';

import { log as baseLog } from '../../../internals/logger';
import { childrenToString } from '../../../internals/utils';
import type { InSimElementProps } from '../InSimElement';
import { InSimElement } from '../InSimElement';
import type {
  Container,
  HostContext,
  PublicInstance,
  TextChildren,
  Type,
  UpdatePayload,
} from '../types';

const log = baseLog.extend('button');

export type ButtonElement = PublicInstance<Button>;

export type ButtonElementProps = InSimElementProps<
  ButtonElement,
  ButtonBaseProps
>;

type ButtonBaseProps = {
  /** 0 to 240 characters of text */
  children?: TextChildren;

  /** Connection to display the button (0 = local / 255 = all) */
  UCID: number;

  /** Width (0 to 200) */
  width: number;

  /** Height (0 to 200) */
  height: number;

  /** Top offset (0 to 200) */
  top: number;

  /** Left offset (0 to 200) */
  left: number;

  /** Preset color variants for text and background */
  variant?: 'light' | 'dark';

  /** Background color */
  background?: 'transparent' | 'light' | 'dark';

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

  /** Label text alignment */
  align: 'left' | 'right' | 'center';

  /** If set, the button text color will appear dimmed and the button will not be clickable */
  isDisabled: boolean;

  /**
   * If set, the user can click this button to type in text. This is the maximum number of characters to type in (0 to 95)
   */
  maxTypeInChars: number;

  /** Initialise dialog with the button's text */
  initializeDialogWithButtonText: boolean;

  /** Sets the caption of the text entry dialog, if enabled by the {@link maxTypeInChars} property */
  caption: string;

  /** Used when user has requested to clear all buttons */
  shouldClearAllButtons: boolean;

  /** A function to be called when a user clicks the button */
  onClick?: (packet: IS_BTC, inSim: InSim) => void;

  /**
   * A function to be called when a user enters a value in the button's dialog.
   *
   * {@link maxTypeInChars} must be set to a value greater than 0.
   */
  onType?: (packet: IS_BTT, inSim: InSim) => void;

  /**
   * NOTE: You should not use this flag for most buttons.
   *
   * This is a special flag for buttons that really must be on in all screens (including the garage and options screens). You will probably need to confine these buttons to the top or bottom edge of the screen, to avoid overwriting LFS buttons. Most buttons should be defined without this flag, and positioned in the recommended area so LFS can keep a space clear in the main screens.
   **/
  isAlwaysOnScreen: boolean;

  flex?: number;
};

export class Button extends InSimElement {
  private static readonly REQUEST_ID = 1;
  private static readonly UCID_ALL = 255;

  private packet: IS_BTN = new IS_BTN();
  private onClickListeners: Required<ButtonElementProps>['onClick'][] = [];
  private onTypeListeners: Required<ButtonElementProps>['onType'][] = [];
  private onNewConnectionListener?: (packet: IS_NCN, inSim: InSim) => void;

  constructor(
    id: number,
    parent: number,
    type: Type,
    props: ButtonElementProps,
    context: HostContext,
    container: Container,
  ) {
    super(id, parent, type, [], context, container);

    this.assertButtonCount(props);

    this.assertTextLength(props);
    this.assertDimensions(props, { checkWidthAndHeight: true });

    this.updateButtonPacketData(props);

    this.addOnClickListener(props);
    this.addOnTypeListener(props);

    this.reinitializeButtonAfterNewConnection();

    this.log('instance created');
  }

  commitMount(props: ButtonElementProps): void {
    this.log(`mount`);

    this.generateClickIdForUCID(this.packet.UCID);

    if (props.shouldClearAllButtons) {
      this.log('do not commit mount - user has hidden all buttons');
      return;
    }

    if (!props.isConnected) {
      this.log('do not commit mount - not connected');
      return;
    }

    this.sendNewButton();
  }

  commitUpdate(
    oldProps: ButtonElementProps,
    newProps: ButtonElementProps,
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): void {
    this.log('update', `[${changedPropNames.join()}]`);

    if (newProps.shouldClearAllButtons) {
      this.log(`do not update - user has hidden all buttons - `);
      return;
    }

    if (!newProps.isConnected) {
      this.log(`do not update - not connected`);
      return;
    }

    this.assertDimensions(newProps);

    const onlyTextChanged = this.onlyTextChanged(changedPropNames);

    if (onlyTextChanged) {
      this.log(`only text changed`);
      this.logClickIds();
      this.sendButtonWithUpdatedText(newProps);
      return;
    }

    this.updateEventListeners(newProps, changedPropNames);

    const onlyEventListenersChanged =
      this.onlyEventListenersChanged(changedPropNames);
    const eventListenersAddedOrRemoved = this.eventListenersAddedOrRemoved(
      oldProps,
      newProps,
    );

    if (eventListenersAddedOrRemoved) {
      this.log('event listeners added or removed');
    }

    if (onlyEventListenersChanged && !eventListenersAddedOrRemoved) {
      this.log(`only event listeners changed - do not send a new packet`);
      return;
    }

    const ucidChanged = changedPropNames.includes('UCID');

    if (ucidChanged) {
      this.updateUCID(oldProps, newProps);
    }

    this.logClickIds();
    this.updateButtonPacketData(newProps);
    this.sendNewButton();
  }

  detachDeletedInstance(): void {
    this.log(`delete`);

    const clickID = this.packet.ClickID;
    const ucid = this.packet.UCID;

    this.deleteButton(clickID, ucid);
    this.removeClickIdForUCID(clickID, ucid);
    this.clearAllListeners();
  }

  private assertDimensions(
    props: ButtonElementProps,
    { checkWidthAndHeight = false }: { checkWidthAndHeight?: boolean } = {},
  ): void {
    if (
      (props.width === 0 && props.height !== 0) ||
      (props.width !== 0 && props.height === 0) ||
      (checkWidthAndHeight && props.width === 0 && props.height === 0)
    ) {
      throw new Error(
        `Invalid button dimensions: W=${props.width} H=${props.height}`,
      );
    }
  }

  private assertTextLength(props: ButtonElementProps): void {
    if (childrenToString(props.children).length > 240) {
      throw new Error('Button text too long');
    }
  }

  private assertButtonCount({ UCID }: ButtonElementProps): void {
    if (this.container.buttonUCIDsByClickID.length > IS_BTN.MAX_CLICK_ID) {
      throw new Error(
        `Too many buttons for UCID ${UCID}. The maximum number of rendered buttons is ${IS_BTN.MAX_CLICK_ID}.`,
      );
    }
  }

  private updateButtonPacketData(props: ButtonElementProps): void {
    const buttonStyle = this.getButtonStyleFromProps(props);
    const initValueButtonText = props.initializeDialogWithButtonText
      ? TypeIn.INIT_VALUE_BUTTON_TEXT
      : 0;
    const textString = childrenToString(props.children);
    const buttonText = props.caption
      ? `\0${props.caption}\0${textString}`
      : textString;

    const buttonData: Required<IS_BTN_Data> = {
      ReqI: Button.REQUEST_ID,
      ClickID: this.packet.ClickID,
      UCID: props.UCID,
      T: props.top,
      L: props.left,
      W: props.width,
      H: props.height,
      Text: buttonText,
      BStyle: buttonStyle,
      TypeIn: props.onType ? props.maxTypeInChars + initValueButtonText : 0,
      Inst: props.isAlwaysOnScreen ? IS_BTN.INST_ALWAYS_ON : 0,
    };

    this.packet = new IS_BTN(buttonData);
  }

  private reinitializeButtonAfterNewConnection(): void {
    this.onNewConnectionListener = (packet: IS_NCN) => {
      if (
        packet.ReqI === 0 &&
        (this.packet.UCID === packet.UCID ||
          this.packet.UCID === Button.UCID_ALL)
      ) {
        this.log('reinitialize existing button');
        this.sendNewButton();
      }
    };
    this.container.inSim.on(PacketType.ISP_NCN, this.onNewConnectionListener);
  }

  private updateEventListeners(
    newProps: ButtonElementProps,
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): void {
    const onClickChanged = changedPropNames.includes('onClick');
    const onTypeChanged = changedPropNames.includes('onType');

    if (onClickChanged) {
      this.log(`onClick changed`);
      this.clearOnClickListeners();
      this.addOnClickListener(newProps);
    }

    if (onTypeChanged) {
      this.log(`onType changed`);
      this.clearOnTypeListeners();
      this.addOnTypeListener(newProps);
    }
  }

  private onlyEventListenersChanged(
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): boolean {
    const onClickChanged = changedPropNames.includes('onClick');
    const onTypeChanged = changedPropNames.includes('onType');

    const eventListenerPropNames: (keyof ButtonElementProps)[] = [];
    onClickChanged && eventListenerPropNames.push('onClick');
    onTypeChanged && eventListenerPropNames.push('onType');

    return changedPropNames.every((prop) =>
      eventListenerPropNames.includes(prop),
    );
  }

  private eventListenersAddedOrRemoved(
    oldProps: ButtonElementProps,
    newProps: ButtonElementProps,
  ): boolean {
    return (
      (oldProps.onClick === undefined && newProps.onClick !== undefined) ||
      (oldProps.onClick !== undefined && newProps.onClick === undefined) ||
      (oldProps.onType === undefined && newProps.onType !== undefined) ||
      (oldProps.onType !== undefined && newProps.onType === undefined)
    );
  }

  private updateUCID(
    oldProps: ButtonElementProps,
    newProps: ButtonElementProps,
  ): void {
    const oldClickId = this.packet.ClickID;
    this.log(`UCID changed from ${oldProps.UCID} to ${newProps.UCID}`);

    if (this.container.buttonUCIDsByClickID[oldClickId]) {
      this.log(`delete UCID ${oldProps.UCID} for ClickID ${oldClickId}`);
      this.container.buttonUCIDsByClickID[oldClickId].delete(oldProps.UCID);
    }

    this.deleteButton(oldClickId, oldProps.UCID);
    this.generateClickIdForUCID(newProps.UCID);
  }

  private getButtonStyleFromProps(props: ButtonElementProps): number {
    let buttonStyle = 0;

    if (
      !props.isDisabled &&
      (props.onClick || (props.onType && props.maxTypeInChars > 0))
    ) {
      buttonStyle |= ButtonStyle.ISB_CLICK;
    }

    if (props.color) {
      buttonStyle |= buttonColorMap[props.color];
    } else if (props.variant) {
      buttonStyle |= buttonVariantColorMap[props.variant];
    }

    if (props.background) {
      buttonStyle |= buttonBackgroundMap[props.background];
    } else if (props.variant) {
      buttonStyle |= buttonVariantBackgroundMap[props.variant];
    }

    buttonStyle |= buttonAlignmentMap[props.align];

    if (props.isDisabled) {
      buttonStyle |= ButtonTextColour.UNAVAILABLE;
    }

    return buttonStyle;
  }

  private generateClickIdForUCID(ucid: number): void {
    const freeClickId = this.container.buttonUCIDsByClickID.findIndex(
      (ucIds) => {
        if (ucid === Button.UCID_ALL) {
          return ucIds.size === 0;
        }

        return !ucIds.has(ucid) && !ucIds.has(Button.UCID_ALL);
      },
    );
    const clickId =
      freeClickId === -1
        ? this.container.buttonUCIDsByClickID.length
        : freeClickId;

    if (freeClickId === -1) {
      this.container.buttonUCIDsByClickID[clickId] = new Set([ucid]);
      this.log(`created new clickID ${clickId} for UCID ${ucid}`);
    } else {
      this.container.buttonUCIDsByClickID[clickId].add(ucid);
      this.log(`found free clickID ${clickId} for UCID ${ucid}`);
    }

    this.logClickIds();

    this.packet.ClickID = clickId + this.container.buttonClickIDStart;
  }

  private addOnClickListener({ onClick }: ButtonElementProps): void {
    if (!onClick) {
      return;
    }

    this.log(`add onClick listener`);

    const onClickListener = (btcPacket: IS_BTC, inSim: InSim) => {
      if (this.packet.ClickID === btcPacket.ClickID) {
        onClick(btcPacket, inSim);
      }
    };

    this.container.inSim.on(PacketType.ISP_BTC, onClickListener);
    this.onClickListeners.push(onClickListener);
  }

  private addOnTypeListener({ onType }: ButtonElementProps): void {
    if (!onType) {
      return;
    }

    this.log(`add onType listener`);

    const onTypeListener = (bttPacket: IS_BTT, inSim: InSim) => {
      if (this.packet.ClickID === bttPacket.ClickID) {
        onType(bttPacket, inSim);
      }
    };

    this.container.inSim.on(PacketType.ISP_BTT, onTypeListener);
    this.onTypeListeners.push(onTypeListener);
  }

  private clearAllListeners(): void {
    this.clearOnClickListeners();
    this.clearOnTypeListeners();
    this.clearOnNewConnectionListener();
  }

  private clearOnClickListeners(): void {
    if (this.onClickListeners && this.onClickListeners.length > 0) {
      this.onClickListeners.forEach(
        (listener: (packet: IS_BTC, inSim: InSim) => void) => {
          this.log(`remove onClick listener`);
          this.container.inSim.off(PacketType.ISP_BTC, listener);
        },
      );
      this.onClickListeners = [];
    }
  }

  private clearOnTypeListeners(): void {
    if (this.onTypeListeners && this.onTypeListeners.length > 0) {
      this.onTypeListeners.forEach(
        (listener: (packet: IS_BTT, inSim: InSim) => void) => {
          this.log(`remove onType listener`);
          this.container.inSim.off(PacketType.ISP_BTT, listener);
        },
      );
      this.onTypeListeners = [];
    }
  }

  private clearOnNewConnectionListener(): void {
    if (this.onNewConnectionListener) {
      this.container.inSim.off(
        PacketType.ISP_NCN,
        this.onNewConnectionListener,
      );
    }
  }

  private onlyTextChanged(
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): boolean {
    const onePropChanged = changedPropNames.length === 1;
    const twoPropsChanged = changedPropNames.length === 2;

    const childrenChanged = changedPropNames.includes('children');
    const captionChanged = changedPropNames.includes('caption');
    const onlyChildrenChanged =
      onePropChanged && changedPropNames[0] === 'children';
    const onlyCaptionChanged =
      onePropChanged && changedPropNames[0] === 'caption';
    const childrenAndCaptionChanged =
      twoPropsChanged && childrenChanged && captionChanged;

    return (
      onlyChildrenChanged || onlyCaptionChanged || childrenAndCaptionChanged
    );
  }

  private sendNewButton(): void {
    this.log('send button');

    const packet = new IS_BTN(this.packet);

    if (this.container.appendButtonIDs) {
      packet.Text += ` [ClickID ${this.packet.ClickID} | UCID ${this.packet.UCID}]`;
    }

    this.container.inSim.send(packet);
  }

  private sendButtonWithUpdatedText(props: ButtonElementProps): void {
    this.log('update button text');

    const text = this.buildButtonText(props);
    const packet = new IS_BTN({
      ...this.packet,
      Text: text,
      W: 0,
      H: 0,
    });

    if (this.container.appendButtonIDs) {
      packet.Text += ` [ClickID ${this.packet.ClickID} | UCID ${this.packet.UCID}]`;
    }

    this.container.inSim.send(packet);
  }

  private deleteButton(clickID: number, ucid: number) {
    this.container.inSim.send(
      new IS_BFN({
        SubT: ButtonFunction.BFN_DEL_BTN,
        ClickID: clickID,
        UCID: ucid,
      }),
    );
  }

  private removeClickIdForUCID(clickID: number, ucid: number): void {
    if (
      this.container.buttonUCIDsByClickID[clickID] &&
      this.container.buttonUCIDsByClickID[clickID].has(ucid)
    ) {
      this.container.buttonUCIDsByClickID[clickID].delete(ucid);
      this.log(`deleted clickID ${clickID} for UCID ${ucid}`);
      this.logClickIds();
    }
  }

  private buildButtonText(props: ButtonElementProps): string {
    const textString = childrenToString(props.children);

    if (props.caption) {
      return `\0${props.caption}\0${textString}`;
    }

    return textString;
  }

  private log(...params: unknown[]) {
    const format = `ID ${this.id} (ClickID ${this.packet.ClickID}, UCID ${this.packet.UCID}) -`;
    log(format, ...params);
  }

  private logClickIds() {
    log(`UCIDs by ClickID:`);
    this.container.buttonUCIDsByClickID.forEach((ucIds, clickID) => {
      log(`- ClickID ${clickID}: ${Array.from(ucIds.values()).join()}`);
    });

    log(`ClickIDs by UCID:`);
    const clickIdsByUCID: Map<number, Set<number>> = new Map();

    this.container.buttonUCIDsByClickID.forEach((ucIds, clickID) => {
      ucIds.forEach((ucid) => {
        if (!clickIdsByUCID.has(ucid)) {
          clickIdsByUCID.set(ucid, new Set([clickID]));
        } else {
          clickIdsByUCID.get(ucid)?.add(clickID);
        }
      });
    });

    clickIdsByUCID.forEach((clickIds, ucid) => {
      log(`- UCID ${ucid}: ${Array.from(clickIds.values()).join()}`);
    });
  }
}

const buttonBackgroundMap: Record<
  Required<ButtonElementProps>['background'],
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

const buttonVariantColorMap: Record<
  Required<ButtonElementProps>['variant'],
  Required<IS_BTN_Data>['BStyle']
> = {
  light: ButtonTextColour.UNSELECTED_TEXT,
  dark: ButtonTextColour.LIGHT_GREY,
};

const buttonVariantBackgroundMap: Record<
  Required<ButtonElementProps>['variant'],
  Required<IS_BTN_Data>['BStyle']
> = {
  light: ButtonStyle.ISB_LIGHT,
  dark: ButtonStyle.ISB_DARK,
};
