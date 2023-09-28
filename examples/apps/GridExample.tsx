import { Button, Grid, GridButton } from '../../src';

export function GridExample() {
  const top = 160;
  const left = 2;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={10}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        Grid
      </Button>
      <Grid
        top={top + 5}
        left={left}
        width={30}
        height={30}
        background="dark"
        backgroundColor="light"
        gridTemplateColumns="1fr 2fr 1fr"
        gridTemplateRows="1fr 3fr 2fr"
        gridColumnGap={1}
        gridRowGap={1}
        UCID={255}
      >
        <GridButton>1</GridButton>
        <GridButton
          gridColumnStart={2}
          gridRowStart={1}
          gridRowEnd={3}
          // margin="3"
          // marginLeft={1}
          // marginRight={1}
          // marginTop={1}
          // marginBottom={1}
          // paddingLeft={3}
          // paddingTop={3}
          color="title"
          background="light"
        >
          2
        </GridButton>
        <GridButton
          gridColumnStart={3}
          gridColumnEnd={4}
          gridRowStart={1}
          gridRowEnd={4}
        >
          3
        </GridButton>
        <GridButton alignSelf="end" height={10}>
          4
        </GridButton>
        <GridButton gridColumnStart={1} gridColumnEnd={3}>
          5
        </GridButton>
      </Grid>
    </>
  );
}
