import { createScope, molecule, use } from 'bunshi';
import { ScopeProvider, useMolecule } from 'bunshi/react';
import { atom, useAtomValue } from 'jotai';
import { type ReactNode } from 'react';

const GlobalScope = createScope(false);

export function GlobalScopeProvider({ children }: { children: ReactNode }) {
  return (
    <ScopeProvider scope={GlobalScope} value={true}>
      {children}
    </ScopeProvider>
  );
}

const globalMolecule = molecule((_, getScope) => {
  use(GlobalScope);

  const global = getScope(GlobalScope);

  return atom((get) => get(atom(global)));
});

/** @internal */
export function useGlobalScope() {
  const globalAtom = useMolecule(globalMolecule);

  return useAtomValue(globalAtom);
}
