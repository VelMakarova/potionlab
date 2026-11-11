import { useEffect, useState, type ReactNode } from 'react';
import { LaboratoryContext } from './model/context';
import { createLaboratoryStore } from './model/laboratoryStore';

export function LaboratoryProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => createLaboratoryStore());
  useEffect(() => {
    void session.store.getState().initialize();
    return session.cancelPending;
  }, [session]);
  return (
    <LaboratoryContext.Provider value={session.store}>
      {children}
    </LaboratoryContext.Provider>
  );
}
