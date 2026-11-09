import type { CatalogState, LaboratoryState } from "./types";
import { validateSelection } from "../rules/validateSelection";
export const emptyFailedImages = Object.freeze({});
export function catalogSnapshot(catalog: CatalogState) {
  if (catalog.status === "ready") return catalog.data;
  return catalog.status === "idle" ? null : catalog.previous;
}
export const selectCatalogReady = (state: LaboratoryState) =>
  state.catalog.status === "ready" &&
  state.catalog.data.language === state.language;
export const selectEditingAllowed = (state: LaboratoryState) =>
  state.brewing.phase === "editing";
export const selectCanBrew = (state: LaboratoryState) =>
  selectCatalogReady(state) &&
  selectEditingAllowed(state) &&
  state.catalog.status === "ready" &&
  validateSelection(state.selectedIds, state.catalog.data.byId) !== null;
export const selectCanAddIngredient = (state: LaboratoryState, id: string) =>
  selectCatalogReady(state) &&
  selectEditingAllowed(state) &&
  state.selectedIds.length < 3 &&
  !state.selectedIds.includes(id) &&
  Boolean(catalogSnapshot(state.catalog)?.byId[id]);
export const selectFailedImages = (state: LaboratoryState) =>
  state.catalog.status === "ready"
    ? state.catalog.failedImageUrls
    : emptyFailedImages;
export const selectIngredient = (state: LaboratoryState, id: string) =>
  catalogSnapshot(state.catalog)?.byId[id];

export function selectVisibleIngredientIds(
  state: LaboratoryState,
  filter: import("../../../shared/types/ingredient").Element | "all",
) {
  if (state.catalog.status !== "ready") return [];
  const { ids, byId } = state.catalog.data;
  return filter === "all"
    ? ids
    : ids.filter((id) => byId[id].element === filter);
}
