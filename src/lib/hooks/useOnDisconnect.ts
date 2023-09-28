import type { InSim, InSimEvents } from 'node-insim';
import { useEffect, useRef } from 'react';
import { useInSim } from 'react-node-insim';

export function useOnDisconnect(handler: InSimEvents['connect']) {
  const handlerRef = useRef(handler);
  const inSim = useInSim();

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (inSim: InSim) => {
      handlerRef.current(inSim);
    };

    inSim.on('connect', listener);

    return () => {
      inSim.off('connect', listener);
    };
  }, []);
}
