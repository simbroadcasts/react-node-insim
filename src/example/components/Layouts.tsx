import React from 'react';

import { Button, Flex, HStack, Stack, VStack } from '../../lib';

export function Layouts() {
  return (
    <>
      <Stack
        direction="horizontal"
        width={15}
        height={6}
        top={10}
        left={10}
        variant="dark"
      >
        <Button>This</Button>
        <Button>Is</Button>
        <Button>Stack</Button>
      </Stack>

      <HStack top={18} left={10} width={15} height={6} variant="dark">
        <Button>This</Button>
        <Button>Is</Button>
        <Button>HStack</Button>
      </HStack>

      <VStack top={26} left={10} width={15} height={6} variant="dark">
        <Button>This</Button>
        <Button>Is</Button>
        <Button>VStack</Button>
      </VStack>

      <Flex
        top={50}
        left={5}
        width={40}
        height={40}
        direction="column"
        // justifyContent="space-between"
        alignItems="stretch"
        backgroundColor="light"
        padding={5}
        paddingLeft={0}
        wrap="wrap"
      >
        <Button width={20} height={10} variant="dark">
          Hello
        </Button>
        <Button width={30} height={8} variant="dark">
          Flex
        </Button>
        <Button width={8} height={5} variant="dark">
          Box
        </Button>
      </Flex>
    </>
  );
}
