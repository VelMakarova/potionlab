import { useContext } from "react";
import { useStore } from "zustand";
import { LaboratoryContext } from "./context";
import type { LaboratoryStore } from "./types";
export function useLaboratoryStore<T>(
  selector: (state: LaboratoryStore) => T,
): T {
  const store = useContext(LaboratoryContext);
  if (!store) throw new Error("LaboratoryProvider is required");
  return useStore(store, selector);
}
