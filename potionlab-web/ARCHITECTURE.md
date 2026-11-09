# Frontend architecture

The frontend uses React, TypeScript, Vite and Zustand. There is no persistence or query-cache library.

## Ownership

- `src/app`: viewport entry point and structural styles. An existing desktop session remains mounted when the window becomes narrower than 1024px.
- `features/laboratory/LaboratoryPage.tsx`: screen composition and local dialog state.
- `features/laboratory/components`: catalog, selection, brewing workspace and dialogs. The element dropdown is local to `IngredientCatalog`, defaults to `all`, and filters the loaded catalog without modifying selection or making requests.
- `features/laboratory/model/types.ts`: catalog and brewing discriminated unions. Selection stores IDs; an attempt captures its three IDs and language.
- `features/laboratory/model/laboratoryStore.ts`: scoped Zustand store factory and guarded user actions. Request controllers, timers and request versions stay in the factory closure, outside store data.
- `features/laboratory/model/selectors.ts`: readiness, selection permissions and visible catalog IDs. Components use narrow subscriptions and shallow comparison for combined selections.
- `features/laboratory/services`: catalog plus startup-image loading, and local-element-or-API brewing orchestration.
- `features/laboratory/rules`: pure selection validation and elemental outcomes. No HTTP, React or translation dependencies.
- `shared/api`: HTTP requests, API configuration, response parsers and typed errors.
- `shared/assets`, `shared/hooks`, `shared/components`, `shared/i18n`, `shared/types`: reusable resources and UI primitives, independent of the laboratory store.

`LaboratoryProvider` creates one store per mounted laboratory session. Its cleanup cancels pending operations; version checks reject late responses even when a dependency ignores cancellation. Successful images share the existing in-memory URL cache. Generation is retried only by explicit user action.

## State transitions

- Editing allows language and selection changes, subject to catalog readiness.
- Brew synchronously locks the cycle and records the attempt before asynchronous work.
- A gameplay result completes the cycle; editing remains locked until a new brew is started.
- A technical error returns to editing with the selection preserved.
- Computed flags such as `canBrew` and `canAddIngredient` are selectors rather than stored state.

## Validation

`npm run build`, `npm run lint`, `npm test`, `npm run test:e2e`.

Store tests cover guards, duplicate submissions, captured attempts, reset, technical retry, stale catalog responses, cancellation and timeout. Browser tests cover the user flow, preloading/fallbacks, full-image dialogs, responsive structure, language locking and element filtering. Element parity checks all 216 ordered element triples against the existing backend evaluator without changing API code.
