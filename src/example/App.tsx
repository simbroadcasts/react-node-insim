import { IS_MSL } from 'node-insim/packets';
import { Button, useInSim } from 'node-insim-react';
import React, { useEffect, useState } from 'react';

import { ButtonStyles, Layouts } from './components';

export function App() {
  const [typeIn, setTypeIn] = useState('');

  const [buttonCount, setButtonCount] = useState(0);

  const { inSim } = useInSim();

  useEffect(() => {
    inSim.send(new IS_MSL({ Msg: 'App mounted' }));
  }, []);

  return (
    <>
      <Layouts />
      {/*<ButtonStyles />*/}
      {/*<Button top={128} left={25} width={30} height={10} align="right">*/}
      {/*  Add buttons*/}
      {/*</Button>*/}
      {/*<Button*/}
      {/*  top={128}*/}
      {/*  left={60}*/}
      {/*  width={10}*/}
      {/*  height={10}*/}
      {/*  variant="dark"*/}
      {/*  onClick={() =>*/}
      {/*    setButtonCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0))*/}
      {/*  }*/}
      {/*>*/}
      {/*  -*/}
      {/*</Button>*/}
      {/*<Button top={128} left={70} width={10} height={10}>*/}
      {/*  {buttonCount}*/}
      {/*</Button>*/}
      {/*<Button*/}
      {/*  top={128}*/}
      {/*  left={80}*/}
      {/*  width={10}*/}
      {/*  height={10}*/}
      {/*  variant="dark"*/}
      {/*  onClick={() => setButtonCount((prevCount) => prevCount + 1)}*/}
      {/*>*/}
      {/*  +*/}
      {/*</Button>*/}

      {/*<Button*/}
      {/*  top={145}*/}
      {/*  left={60}*/}
      {/*  width={30}*/}
      {/*  height={10}*/}
      {/*  variant="dark"*/}
      {/*  maxTypeInChars={10}*/}
      {/*  onType={(packet) => {*/}
      {/*    console.log('Typed in button ID', packet.ClickID, `: ${packet.Text}`);*/}
      {/*    setTypeIn(packet._raw.Text);*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Open dialog*/}
      {/*</Button>*/}
      {/*<Button*/}
      {/*  top={145}*/}
      {/*  left={90}*/}
      {/*  width={30}*/}
      {/*  height={10}*/}
      {/*  variant="light"*/}
      {/*  color="unselected"*/}
      {/*>*/}
      {/*  {typeIn}*/}
      {/*</Button>*/}

      {/*{Array(buttonCount)*/}
      {/*  .fill(0)*/}
      {/*  .map((_, index) => (*/}
      {/*    <Button key={index} top={140} left={index * 4} width={4} height={5}>*/}
      {/*      {index}*/}
      {/*    </Button>*/}
      {/*  ))}*/}
    </>
  );
}
