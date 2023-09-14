import { useEffect } from 'react';

import {
  Buttons,
  FlexLayout,
  GridLayout,
  InSimEvents,
  TypeIn,
} from './components';

export function App() {
  useEffect(() => {
    console.log('App mounted');
    // InSimRenderer.dumpTree();
  }, []);

  return (
    <>
      <Buttons />
      {/*<InSimEvents />*/}
      {/*<FlexLayout />*/}
      {/*<GridLayout />*/}
      {/*<TypeIn />*/}
    </>
  );
}
