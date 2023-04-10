import React, { useEffect } from 'react';

import { InSimEvents, Layouts, TypeIn } from './components';

export function App() {
  useEffect(() => {
    console.log('App mounted');
    console.log('');
    // InSimRenderer.dumpTree();
  }, []);

  return (
    <>
      {/*<InSimEvents />*/}
      <Layouts />
      {/*<TypeIn />*/}
    </>
  );
}
