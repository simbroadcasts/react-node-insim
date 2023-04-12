import { Grid, GridButton } from 'react-node-insim';

export function GridLayout() {
  return (
    <Grid
      top={10}
      left={10}
      width={100}
      height={60}
      variant="dark"
      backgroundColor="light"
      gridTemplateColumns="1fr 2fr 1fr"
      gridTemplateRows="1fr 3fr 2fr"
      gridColumnGap={2}
      gridRowGap={2}
    >
      <GridButton>1</GridButton>
      <GridButton
        gridColumnStart={2}
        gridRowStart={1}
        gridRowEnd={3}
        // margin="3"
        marginLeft={1}
        marginRight={1}
        marginTop={1}
        marginBottom={1}
        // paddingLeft={3}
        // paddingTop={3}
        color="title"
        variant="light"
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
  );
}
