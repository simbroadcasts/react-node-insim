import { Button, TextArea } from '../../src';

export function TextAreaExample() {
  const top = 160;
  const left = 138;
  const width = 20;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        TextArea
      </Button>
      <TextArea
        top={top + 5}
        left={left}
        cols={25}
        width={width}
        rowHeight={4}
        UCID={255}
        variant="dark"
      >
        Hello world this is a text area lorem ipsum dolor sit amet consectetur
        adipisicing elit sed do eiusmod
      </TextArea>
      <TextArea
        top={top + 5}
        left={left + width}
        rows={3}
        cols={25}
        width={width}
        rowHeight={4}
        UCID={255}
        variant="dark"
      >
        Hello world this is a text area lorem ipsum dolor sit amet consectetur
        adipisicing elit sed do eiusmod
      </TextArea>
    </>
  );
}
