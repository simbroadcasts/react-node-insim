import {
  Button,
  ConnectionScopeProvider,
  GlobalScopeProvider,
  HStack,
  HumanPlayerScopeProvider,
  useConnectionScope,
  useHumanPlayerScope,
} from 'react-node-insim';

export function ScopesExample() {
  return (
    <>
      <GlobalScopeProvider>
        <Button
          top={0}
          left={80}
          height={5}
          width={40}
          align="left"
          variant="light"
        >
          React Node InSim
        </Button>
      </GlobalScopeProvider>
      <ConnectionScopeProvider>
        <UserNameButton />
        <HumanPlayerScopeProvider>
          <HumanPlayerNameButton />
        </HumanPlayerScopeProvider>
      </ConnectionScopeProvider>
    </>
  );
}

function UserNameButton() {
  const { UName } = useConnectionScope();

  return (
    <HStack top={5} left={80} height={5}>
      <Button width={15} align="left" color="title">
        Username
      </Button>
      <Button width={25} variant="dark">
        {UName}
      </Button>
    </HStack>
  );
}

function HumanPlayerNameButton() {
  const { PName } = useHumanPlayerScope();

  return (
    <HStack top={10} left={80} height={5}>
      <Button width={15} align="left" color="title">
        Player name
      </Button>
      <Button width={25} variant="dark">
        {PName}
      </Button>
    </HStack>
  );
}
