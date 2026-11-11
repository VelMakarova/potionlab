import { useEffect, useState, type ReactNode } from 'react';
import { LaboratoryContext } from './model/context';
import { createLaboratoryStore } from './model/laboratoryStore';

export function LaboratoryProvider({
  children,
  started,
}: {
  children: ReactNode;
  started: boolean;
}) {
  const [session] = useState(() => createLaboratoryStore());
  useEffect(() => {
    if (!started) return;
    void session.store.getState().initialize();
    return session.cancelPending;
  }, [session, started]);
  return (
    <LaboratoryContext.Provider value={session.store}>
      {children}
    </LaboratoryContext.Provider>
  );
}
