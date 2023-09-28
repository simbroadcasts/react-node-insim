import { Button, HStack, VStack } from '../../src';

export function StackLayout() {
  return (
    <>
      <Button
        top={160}
        left={70}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        VStack
      </Button>
      <VStack
        top={165}
        left={70}
        width={20}
        height={4}
        variant="dark"
        UCID={255}
      >
        <Button>Stacked button 1</Button>
        <Button>Stacked button 2</Button>
        <Button>Stacked button 3</Button>
        <Button>Stacked button 4</Button>
      </VStack>
      <VStack top={165} left={92} width={25} variant="dark" UCID={255}>
        <Button height={4}>Height: 4</Button>
        <Button height={10}>Height: 10</Button>
        <Button height={14}>Height: 14</Button>
        <Button height={6}>Height: 6</Button>
      </VStack>
      <Button
        top={160}
        left={118}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        HStack
      </Button>
      <HStack
        top={165}
        left={118}
        width={3}
        height={4}
        variant="dark"
        UCID={255}
      >
        <Button>1</Button>
        <Button>2</Button>
        <Button>3</Button>
        <Button>4</Button>
        <Button>5</Button>
        <Button>6</Button>
      </HStack>
      <HStack
        top={171}
        left={118}
        width={4}
        height={4}
        variant="dark"
        UCID={255}
      >
        <Button width={3}>3</Button>
        <Button width={5}>5</Button>
        <Button width={9}>9</Button>
        <Button width={4}>4</Button>
      </HStack>
    </>
  );
}
