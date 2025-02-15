import { createScope, molecule, use } from 'bunshi';
import { ScopeProvider, useMolecule } from 'bunshi/react';
import { atom, useAtomValue } from 'jotai';
import { type ReactNode } from 'react';
import { type Connection, useConnections } from 'react-node-insim';

export const ConnectionScope = createScope<Connection | null>(null);

export function ConnectionScopeProvider({ children }: { children: ReactNode }) {
  const connections = useConnections();

  return (
    <>
      {connections.map((connection) => (
        <ScopeProvider
          key={connection.UCID}
          scope={ConnectionScope}
          value={connection}
        >
          {children}
        </ScopeProvider>
      ))}
    </>
  );
}

const connectionMolecule = molecule((_, getScope) => {
  use(ConnectionScope);

  const connection = getScope(ConnectionScope);

  return atom((get) => get(atom(connection)));
});

/** @internal */
export function useConnectionMaybeScope() {
  const connectionAtom = useMolecule(connectionMolecule);

  return useAtomValue(connectionAtom);
}

export function useConnectionScope() {
  const connection = useConnectionMaybeScope();

  if (!connection) {
    throw new Error(
      'useConnectionScope must be called within <ConnectionScopeProvider>.',
    );
  }

  return connection;
}
