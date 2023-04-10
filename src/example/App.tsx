import React, { useEffect } from 'react';

import { Layouts, TypeIn } from './components';

export function App() {
  useEffect(() => {
    console.log('App mounted');

    console.log('');
    // InSimRenderer.dumpTree();

    // const a = setTimeout(() => {
    //   setVariant('light');
    //
    //   // setButtonCount((prevState) => prevState + 1);
    //   setIsShown(false);
    // }, 1000);

    // const timeout = setTimeout(() => {
    // setIsShown(true);
    // }, 1000);

    return () => {
      // clearTimeout(a);
      // clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <Layouts />
      {/*<TypeIn />*/}
    </>
  );
}
