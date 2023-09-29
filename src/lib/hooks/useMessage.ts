import type { MessageSound } from 'node-insim/packets';
import { IS_MTC } from 'node-insim/packets';
import { useInSim } from 'react-node-insim';

export function useMessage() {
  const inSim = useInSim();

  const sendMessageToConnection = (
    UCID: number,
    text: string,
    sound?: MessageSound,
  ) => {
    inSim.send(new IS_MTC({ UCID, Text: text, Sound: sound }));
  };

  const sendMessageToPlayer = (
    PLID: number,
    text: string,
    sound?: MessageSound,
  ) => {
    inSim.send(new IS_MTC({ PLID, Text: text, Sound: sound }));
  };

  return {
    sendMessageToConnection,
    sendMessageToPlayer,
  };
}
