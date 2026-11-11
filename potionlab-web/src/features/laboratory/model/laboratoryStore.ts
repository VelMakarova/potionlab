import { createStore } from 'zustand/vanilla';
import { loadLaboratory } from '../services/loadLaboratory';
import { brewPotion, classifyBrewError } from '../services/brewPotion';
import { validateSelection } from '../rules/validateSelection';
import {
  catalogSnapshot,
  selectCanAddIngredient,
  selectCanBrew,
  selectCatalogReady,
  selectEditingAllowed,
} from './selectors';
import type { Language } from '../../../shared/i18n/types';
import type { BrewAttempt, LaboratoryStore } from './types';

const LANGUAGE_STORAGE_KEY = 'language';

function readLanguage(): Language {
  try {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (language === 'en' || language === 'ua') return language;
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
  return 'en';
}

export function createLaboratoryStore(
  dependencies = { load: loadLaboratory, brew: brewPotion }
) {
  let catalogController: AbortController | null = null;
  let brewController: AbortController | null = null;
  let catalogVersion = 0;
  let brewVersion = 0;
  let brewTimer: ReturnType<typeof setTimeout> | undefined;

  const store = createStore<LaboratoryStore>()((set, get) => {
    async function load() {
      const version = ++catalogVersion;

      catalogController?.abort();
      const controller = new AbortController();

      catalogController = controller;
      const language = get().language;

      set((state) => ({
        catalog: {
          status: 'loading',
          previous: catalogSnapshot(state.catalog),
        },
      }));

      try {
        const catalog = await dependencies.load(language, controller.signal);

        if (version === catalogVersion && !controller.signal.aborted)
          set({ catalog: { status: 'ready', ...catalog } });
      } catch {
        if (version === catalogVersion && !controller.signal.aborted) {
          set((state) => ({
            catalog: {
              status: 'error',
              previous: catalogSnapshot(state.catalog),
              error: 'unavailable',
            },
          }));
        }
      }
    }

    return {
      language: readLanguage(),
      catalog: { status: 'idle' },
      selectedIds: [],
      brewing: { phase: 'editing', error: null },
      async initialize() {
        if (!selectCatalogReady(get())) await load();
      },
      async retryCatalog() {
        if (get().catalog.status === 'error' && selectEditingAllowed(get()))
          await load();
      },
      async changeLanguage(language) {
        if (!selectEditingAllowed(get()) || language === get().language) return;
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch {
          // Language switching remains available when storage is blocked.
        }
        set({ language, brewing: { phase: 'editing', error: null } });
        await load();
      },
      addIngredient(id) {
        if (!selectCanAddIngredient(get(), id)) return;
        set((state) => ({
          selectedIds: [...state.selectedIds, id],
          brewing: { phase: 'editing', error: null },
        }));
      },
      removeIngredient(id) {
        if (!selectEditingAllowed(get()) || !selectCatalogReady(get())) return;
        set((state) => ({
          selectedIds: state.selectedIds.filter((value) => value !== id),
          brewing: { phase: 'editing', error: null },
        }));
      },
      async brew() {
        const state = get();

        if (!selectCanBrew(state) || state.catalog.status !== 'ready') return;
        const items = validateSelection(
          state.selectedIds,
          state.catalog.data.byId
        );

        if (!items) return;
        const attempt: BrewAttempt = {
          ingredientIds: [items[0].id, items[1].id, items[2].id],
          language: state.language,
        };

        // The synchronous transition guards repeated calls before any network work begins.
        set({ brewing: { phase: 'brewing', attempt } });
        const version = ++brewVersion;
        const controller = new AbortController();

        brewController = controller;
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, 60000);

        brewTimer = timer;
        try {
          const result = await dependencies.brew(
            attempt,
            items,
            controller.signal
          );

          if (version !== brewVersion) return;
          if (controller.signal.aborted) throw new Error('Request aborted');
          set({ brewing: { phase: 'complete', attempt, result } });
        } catch (error) {
          if (version === brewVersion)
            set({
              brewing: {
                phase: 'editing',
                error: classifyBrewError(error, timedOut),
              },
            });
        } finally {
          clearTimeout(timer);
          if (version === brewVersion) {
            brewController = null;
            brewTimer = undefined;
          }
        }
      },
      startNewBrew() {
        if (get().brewing.phase !== 'complete') return;
        set({ selectedIds: [], brewing: { phase: 'editing', error: null } });
      },
    };
  });

  function cancelPending() {
    catalogVersion++;
    brewVersion++;
    catalogController?.abort();
    brewController?.abort();
    clearTimeout(brewTimer);
    catalogController = null;
    brewController = null;
    brewTimer = undefined;
  }
  return { store, cancelPending };
}

export type LaboratoryStoreApi = ReturnType<
  typeof createLaboratoryStore
>['store'];
