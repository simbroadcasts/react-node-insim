import { IS_MST, IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import { useEffect } from 'react';
import { useInSim, useOnConnect, useOnPacket } from 'react-node-insim';

import { log } from '../src/lib/internals/logger';
import { TypeIn } from './components';

export function App() {
  const inSim = useInSim();

  useEffect(() => {
    log('App mounted');

    setTimeout(() => {
      inSim.send(
        new IS_TINY({
          ReqI: 2,
          SubT: TinyType.TINY_VER,
        }),
      );
    }, 2000);
  }, []);

  useOnConnect((packet, inSim) => {
    log(`Connected to LFS ${packet.Product} ${packet.Version}`);
    inSim.send(new IS_MST({ Msg: `React Node InSim connected` }));
  });

  useOnPacket(PacketType.ISP_VER, (packet, inSim) => {
    if (packet.ReqI === 2) {
      inSim.send(new IS_MST({ Msg: `Version requested` }));
    }
  });

  return (
    <>
      {/*<Buttons />*/}
      {/*<InSimEvents />*/}
      {/*<FlexLayout />*/}
      {/*<GridLayout />*/}
      <TypeIn />
    </>
  );
}
