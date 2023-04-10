import React, { useEffect } from 'react';

import { Layouts, TypeIn } from './components';

export function App() {
  useEffect(() => {
    console.log('App mounted');
    console.log('');
    // InSimRenderer.dumpTree();
  }, []);

  return (
    <>
      <Layouts />
      {/*<TypeIn />*/}
    </>
  );
}
