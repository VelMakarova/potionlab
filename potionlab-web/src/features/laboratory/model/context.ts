import { createContext } from "react";
import type { LaboratoryStoreApi } from "./laboratoryStore";
export const LaboratoryContext = createContext<LaboratoryStoreApi | null>(null);
