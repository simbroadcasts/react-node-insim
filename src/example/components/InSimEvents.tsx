import { IS_TINY, TinyType } from 'node-insim/packets';
import { Button, InSim, useInSim } from 'node-insim-react';

export function InSimEvents() {
  const inSim = useInSim();

  return (
    <InSim
      onStateChanged={() => console.log('state changed')}
      onMessage={(packet) => console.log('message received', packet.Msg)}
      onVersion={(packet) => console.log('version', packet.Version)}
    >
      <Button
        top={30}
        left={30}
        width={25}
        height={6}
        variant="dark"
        onClick={() => {
          inSim.send(
            new IS_TINY({
              ReqI: 1,
              SubT: TinyType.TINY_VER,
            }),
          );
        }}
      >
        Request version
      </Button>
    </InSim>
  );
}
