import type { IS_BTT } from 'node-insim/packets';
import { useCallback, useState } from 'react';
import { Button, useConnections, VStack } from 'react-node-insim';

export function Buttons() {
  const connections = useConnections();
  const [UCID, setUCID] = useState(0);

  const onChangeUcid = useCallback(({ Text }: IS_BTT) => {
    const ucid = parseInt(Text);

    if (isNaN(ucid) || ucid < 0 || ucid > 255) {
      return;
    }

    setUCID(ucid);
  }, []);

  const getButtonTextForConnection = () => {
    if (UCID === 255) {
      return 'everyone';
    }

    if (UCID === 0) {
      return 'local';
    }

    const connection = connections[UCID];
    if (!connection) {
      return '-';
    }

    return `${connection?.PName}^9 (${connection?.UName})`;
  };

  const connectionButtonText = getButtonTextForConnection();

  return (
    <>
      <VStack top={10} left={145} width={45} height={6}>
        <Button UCID={255} color="title" align="left">
          Select UCID
        </Button>
        <Button
          variant="dark"
          caption="UCID"
          color="textstring"
          align="left"
          UCID={255}
          maxTypeInChars={3}
          onType={onChangeUcid}
        >
          {UCID}
        </Button>
        <Button UCID={255} color="title" align="left">
          Test button appears below
        </Button>
        <Button variant="dark" UCID={UCID}>
          {connectionButtonText}
        </Button>
      </VStack>
    </>
  );
}
