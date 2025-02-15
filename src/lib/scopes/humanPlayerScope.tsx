import { createScope, molecule, use } from 'bunshi';
import { ScopeProvider, useMolecule } from 'bunshi/react';
import { atom, useAtomValue } from 'jotai';
import { PlayerType } from 'node-insim/packets';
import { type ReactNode } from 'react';
import type { Player } from 'react-node-insim';
import {
  ConnectionScopeProvider,
  useConnectionMaybeScope,
  useConnectionScope,
  usePlayers,
} from 'react-node-insim';

export const HumanPlayerScope = createScope<Player | null>(null);

export function HumanPlayerScopeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const connection = useConnectionMaybeScope();

  if (!connection) {
    return (
      <ConnectionScopeProvider>
        <HumanPlayerScopeProviderInConnectionScope>
          {children}
        </HumanPlayerScopeProviderInConnectionScope>
      </ConnectionScopeProvider>
    );
  }

  return (
    <HumanPlayerScopeProviderInConnectionScope>
      {children}
    </HumanPlayerScopeProviderInConnectionScope>
  );
}

function HumanPlayerScopeProviderInConnectionScope({
  children,
}: {
  children: ReactNode;
}) {
  const connection = useConnectionScope();
  const players = usePlayers();

  const humanPlayer = Array.from(players.values()).find((player) => {
    return (
      player.UCID === connection.UCID && (player.PType & PlayerType.AI) === 0
    );
  });

  if (!humanPlayer) {
    return null;
  }

  return (
    <ScopeProvider scope={HumanPlayerScope} value={humanPlayer}>
      {children}
    </ScopeProvider>
  );
}

const humanPlayerMolecule = molecule((_, getScope) => {
  use(HumanPlayerScope);

  const player = getScope(HumanPlayerScope);

  return atom((get) => get(atom(player)));
});

/** @internal */
export function useHumanPlayerMaybeScope() {
  const humanPlayerAtom = useMolecule(humanPlayerMolecule);

  return useAtomValue(humanPlayerAtom);
}

export function useHumanPlayerScope() {
  const player = useHumanPlayerMaybeScope();

  if (!player) {
    throw new Error(
      'useHumanPlayerScope must be called within <PlayerScopeProvider>.',
    );
  }

  return player;
}
