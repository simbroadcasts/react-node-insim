import React, { useEffect } from 'react';

import { FlexLayout, GridLayout } from './components';

export function App() {
  useEffect(() => {
    console.log('App mounted');
    console.log('');
    // InSimRenderer.dumpTree();
  }, []);

  return (
    <>
      {/*<InSimEvents />*/}
      {/*<FlexLayout />*/}
      <GridLayout />
      {/*<TypeIn />*/}
    </>
  );
}
