import { ButtonStyle, IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button, Flex } from '../src';

describe('Flex', () => {
  it('should position children in a row using the yoga-computed layout', async () => {
    await expect(
      <Flex top={10} left={20} width={100} height={50}>
        <Button width={20} height={10}>
          One
        </Button>
        <Button width={30} height={15}>
          Two
        </Button>
      </Flex>,
    ).toSendButtonPackets(
      [
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          T: 10,
          L: 20,
          W: 20,
          H: 10,
          Text: 'One',
        }),
        new IS_BTN({
          ClickID: 1,
          ReqI: 1,
          T: 10,
          L: 40,
          W: 30,
          H: 15,
          Text: 'Two',
        }),
      ],
    );
  });

  it('should render a background filler button covering the whole flex area', async () => {
    await expect(
      <Flex top={5} left={5} width={100} height={50} backgroundColor="dark">
        <Button width={20} height={10}>
          One
        </Button>
      </Flex>,
    ).toSendButtonPackets(
      [
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          T: 5,
          L: 5,
          W: 100,
          H: 50,
          Text: '',
          BStyle: ButtonStyle.ISB_DARK,
        }),
        new IS_BTN({
          ClickID: 1,
          ReqI: 1,
          T: 5,
          L: 5,
          W: 20,
          H: 10,
          Text: 'One',
        }),
      ],
    );
  });

  it('should render 4 border filler buttons and shift children inside the border', async () => {
    await expect(
      <Flex
        top={0}
        left={0}
        width={40}
        height={30}
        borderSize={2}
        borderColor="light"
      >
        <Button width={10} height={10}>
          One
        </Button>
      </Flex>,
    ).toSendButtonPackets(
      [
        // Left edge
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          T: 0,
          L: 0,
          W: 2,
          H: 30,
          Text: '',
          BStyle: ButtonStyle.ISB_LIGHT,
        }),
        // Right edge
        new IS_BTN({
          ClickID: 1,
          ReqI: 1,
          T: 0,
          L: 38,
          W: 2,
          H: 30,
          Text: '',
          BStyle: ButtonStyle.ISB_LIGHT,
        }),
        // Top edge
        new IS_BTN({
          ClickID: 2,
          ReqI: 1,
          T: 0,
          L: 0,
          W: 40,
          H: 2,
          Text: '',
          BStyle: ButtonStyle.ISB_LIGHT,
        }),
        // Bottom edge
        new IS_BTN({
          ClickID: 3,
          ReqI: 1,
          T: 28,
          L: 0,
          W: 40,
          H: 2,
          Text: '',
          BStyle: ButtonStyle.ISB_LIGHT,
        }),
        // Child, shifted inside the border
        new IS_BTN({
          ClickID: 4,
          ReqI: 1,
          T: 2,
          L: 2,
          W: 10,
          H: 10,
          Text: 'One',
        }),
      ],
    );
  });
});
