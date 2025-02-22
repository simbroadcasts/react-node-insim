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
import { pipe } from 'ramda';
import type { YogaNode } from 'yoga-layout-prebuilt';

import { log as baseLog } from '../../../internals/logger';
import { childrenToString } from '../../../internals/utils';
import type { InSimElementProps } from '../InSimElement';
import { InSimElement } from '../InSimElement';
import { getAbsolutePosition } from '../node';
import type { StyleProps } from '../styleProps';
import applyStyles from '../styleProps';
import type {
  Container,
  HostContext,
  PublicInstance,
  TextChildren,
  UpdatePayload,
} from '../types';

const log = baseLog.extend('button');

export type ButtonElementInstance = PublicInstance<ButtonElement>;

export type ButtonElementProps = InSimElementProps<
  ButtonElementInstance,
  ButtonBaseProps
>;

const semanticColorMap = {
  default: ButtonTextColour.LIGHT_GREY,
  title: ButtonTextColour.TITLE_COLOUR,
  unselected: ButtonTextColour.UNSELECTED_TEXT,
  selected: ButtonTextColour.SELECTED_TEXT,
  ok: ButtonTextColour.OK,
  cancel: ButtonTextColour.CANCEL,
  textstring: ButtonTextColour.TEXT_STRING,
  unavailable: ButtonTextColour.UNAVAILABLE,
} as const;

type SemanticColor = keyof typeof semanticColorMap;

const lfsPaletteColors = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
] as const;

type LfsPaletteColor = (typeof lfsPaletteColors)[number];

type ButtonBaseProps = StyleProps & {
  /** 0 to 240 characters of text */
  children?: TextChildren;

  /** Connection to display the button (0 = local / 255 = all) */
  UCID: number;

  /** Top offset (0 to 200). If not specified, the button is positioned according to the parent layout. */
  top?: number;

  /** Left offset (0 to 200). If not specified, the button is positioned according to the parent layout.  */
  left?: number;

  /** Preset color variants for text and background */
  variant?: 'light' | 'dark';

  /** Background color */
  background?: 'transparent' | 'light' | 'dark';

  /** Label text color */
  color?: SemanticColor | LfsPaletteColor;

  /** Label text alignment */
  textAlign: 'left' | 'right' | 'center';

  /** If set, the button text color will appear dimmed and the button will not be clickable */
  isDisabled: boolean;

  /**
   * If set, the user can click this button to type in text. This is the maximum number of characters to type in (0 to
   * 95)
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
   * This is a special flag for buttons that really must be on in all screens (including the garage and options
   * screens). You will probably need to confine these buttons to the top or bottom edge of the screen, to avoid
   * overwriting LFS buttons. Most buttons should be defined without this flag, and positioned in the recommended area
   * so LFS can keep a space clear in the main screens.
   **/
  isAlwaysOnScreen: boolean;

  flex?: number;
};

export class ButtonElement extends InSimElement {
  public static readonly REQUEST_ID = 1;
  public static readonly UCID_ALL = 255;
  public static readonly MAX_SIZE = 200;

  private packet: IS_BTN = new IS_BTN();

  private onClick: ButtonElementProps['onClick'];
  private onClickListener: ButtonElementProps['onClick'];

  private onType: ButtonElementProps['onType'];
  private onTypeListener: ButtonElementProps['onType'];

  private onNewConnectionListener?: (packet: IS_NCN, inSim: InSim) => void;

  constructor(
    id: number,
    props: ButtonElementProps,
    context: HostContext,
    container: Container,
    node: YogaNode,
  ) {
    super(id, null, 'lfs-button', props, [], context, container, node);

    this.onClick = props.onClick;
    this.onType = props.onType;

    this.assertButtonCount(props);
    this.assertTextLength(props);

    if (this.onClick) {
      this.log(`add onClick listener`);

      const onClickListener = (btcPacket: IS_BTC, inSim: InSim) => {
        if (
          this.packet.ClickID === btcPacket.ClickID &&
          (this.packet.UCID === btcPacket.UCID ||
            this.packet.UCID === ButtonElement.UCID_ALL)
        ) {
          this.onClick?.(btcPacket, inSim);
        }
      };

      this.container.inSim.on(PacketType.ISP_BTC, onClickListener);
      this.onClickListener = onClickListener;
    }

    if (this.onType) {
      this.log(`add onType listener`);

      const onTypeListener = (bttPacket: IS_BTT, inSim: InSim) => {
        if (
          this.packet.ClickID === bttPacket.ClickID &&
          (this.packet.UCID === bttPacket.UCID ||
            this.packet.UCID === ButtonElement.UCID_ALL)
        ) {
          this.onType?.(bttPacket, inSim);
        }
      };

      this.container.inSim.on(PacketType.ISP_BTT, onTypeListener);
      this.onTypeListener = onTypeListener;
    }

    this.reinitializeButtonAfterNewConnection();

    this.log('instance created');
  }

  commitMount(props: ButtonElementProps): void {
    this.log(`mount`);

    this.updateButtonPacketData(props);
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

  updateLayout() {
    const { left, top, width, height } = getAbsolutePosition(this.node);
    this.log('updateLayout', { left, top, width, height });

    if (
      left === this.packet.L &&
      top === this.packet.T &&
      width === this.packet.W &&
      height === this.packet.H
    ) {
      this.log('nothing to update - do not send new button');
      return;
    }

    this.packet.L = Math.min(left, ButtonElement.MAX_SIZE);
    this.packet.T = Math.min(top, ButtonElement.MAX_SIZE);
    this.packet.W = Math.min(width, ButtonElement.MAX_SIZE);
    this.packet.H = Math.min(height, ButtonElement.MAX_SIZE);

    this.sendNewButton();
  }

  commitUpdate(
    oldProps: ButtonElementProps,
    newProps: ButtonElementProps,
    changedPropNames: NonNullable<UpdatePayload<ButtonElementProps>>,
  ): void {
    this.log('update', `[${changedPropNames.join()}]`);

    if (newProps.shouldClearAllButtons) {
      this.log(`do not update - user has hidden all buttons`);
      return;
    }

    if (!newProps.isConnected) {
      this.log(`do not update - not connected`);
      return;
    }

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
    this.packet.ReqI = ButtonElement.REQUEST_ID;
    this.packet.UCID = props.UCID;

    const { left, top, width, height } = getAbsolutePosition(this.node);

    this.packet.L = Math.min(left, ButtonElement.MAX_SIZE);
    this.packet.T = Math.min(top, ButtonElement.MAX_SIZE);
    this.packet.W = Math.min(width, ButtonElement.MAX_SIZE);
    this.packet.H = Math.min(height, ButtonElement.MAX_SIZE);

    this.packet.BStyle = this.getButtonStyleFromProps(props);
    const initValueButtonText = props.initializeDialogWithButtonText
      ? TypeIn.INIT_VALUE_BUTTON_TEXT
      : 0;

    this.packet.Text = this.buildButtonText(props);
    this.packet.TypeIn = props.onType
      ? props.maxTypeInChars + initValueButtonText
      : 0;

    this.packet.Inst = props.isAlwaysOnScreen ? IS_BTN.INST_ALWAYS_ON : 0;
  }

  private reinitializeButtonAfterNewConnection(): void {
    this.onNewConnectionListener = (packet: IS_NCN) => {
      if (
        packet.ReqI === 0 &&
        (this.packet.UCID === packet.UCID ||
          this.packet.UCID === ButtonElement.UCID_ALL)
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
      this.onClick = newProps.onClick;
    }

    if (onTypeChanged) {
      this.log(`onType changed`);
      this.onType = newProps.onType;
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

    if (this.isSemanticColor(props.color)) {
      buttonStyle |= semanticColorMap[props.color];
    } else if (props.variant) {
      buttonStyle |= buttonVariantColorMap[props.variant];
    }

    if (props.background) {
      buttonStyle |= buttonBackgroundMap[props.background];
    } else if (props.variant) {
      buttonStyle |= buttonVariantBackgroundMap[props.variant];
    }

    buttonStyle |= buttonAlignmentMap[props.textAlign];

    if (props.isDisabled) {
      buttonStyle |= ButtonTextColour.UNAVAILABLE;
    }

    return buttonStyle;
  }

  private isSemanticColor(
    color?: ButtonElementProps['color'],
  ): color is SemanticColor {
    return color !== undefined && color in semanticColorMap;
  }

  private generateClickIdForUCID(ucid: number): void {
    const freeClickId = this.container.buttonUCIDsByClickID.findIndex(
      (ucIds) => {
        if (ucid === ButtonElement.UCID_ALL) {
          return ucIds.size === 0;
        }

        return !ucIds.has(ucid) && !ucIds.has(ButtonElement.UCID_ALL);
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

  private clearAllListeners(): void {
    this.clearOnClickListener();
    this.clearOnTypeListener();
    this.clearOnNewConnectionListener();
  }

  private clearOnClickListener(): void {
    if (this.onClickListener) {
      this.container.inSim.off(PacketType.ISP_BTC, this.onClickListener);
      this.onClickListener = undefined;
    }
  }

  private clearOnTypeListener(): void {
    if (this.onTypeListener) {
      this.container.inSim.off(PacketType.ISP_BTT, this.onTypeListener);
      this.onTypeListener = undefined;
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

  // TODO return true if onClick or onType also changed
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
    const addCaption = (text: string): string =>
      props.caption ? `\0${props.caption}\0${text}` : text;

    const addColor = (text: string): string =>
      props.color && !this.isSemanticColor(props.color)
        ? `^${lfsPaletteColors.indexOf(props.color)}${text}`
        : text;

    return pipe(childrenToString, addCaption, addColor)(props.children);
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
  Required<ButtonElementProps>['textAlign'],
  ButtonStyle
> = {
  left: ButtonStyle.ISB_LEFT,
  center: 0,
  right: ButtonStyle.ISB_RIGHT,
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
