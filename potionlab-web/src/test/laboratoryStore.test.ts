import { afterEach, describe, expect, it, vi } from "vitest";
import { createLaboratoryStore } from "../features/laboratory/model/laboratoryStore";
import { selectCanBrew } from "../features/laboratory/model/selectors";
import type { brewPotion } from "../features/laboratory/services/brewPotion";
import { HttpError } from "../shared/api/errors";
import type { Ingredient } from "../shared/types/ingredient";
import type { BrewResult } from "../shared/types/brewing";
import type { Language } from "../shared/i18n/types";

const items: Ingredient[] = ["fire", "earth", "water", "light"].map(
  (element, i) => ({
    id: String(i),
    element: element as Ingredient["element"],
    name: `Name ${i}`,
    description: "",
    properties: ["healing"],
    assets: { full: `full-${i}`, thumb64: `64-${i}`, thumb128: `128-${i}` },
  }),
);
function snapshot(language: Language) {
  return {
    data: {
      language,
      ids: items.map((item) => item.id),
      byId: Object.fromEntries(items.map((item) => [item.id, item])),
    },
    failedImageUrls: {},
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function fixture() {
  const load = vi.fn(async (language: Language) => snapshot(language));
  const brew = vi
    .fn<typeof brewPotion>()
    .mockResolvedValue({ status: "useless" });
  const session = createLaboratoryStore({ load, brew });
  return { ...session, load, brew, actions: () => session.store.getState() };
}
afterEach(() => vi.useRealTimers());

describe("laboratory state transitions", () => {
  it("guards catalog availability, duplicates, fourth ingredient, and unresolved ids", async () => {
    const f = fixture();
    f.actions().addIngredient("0");
    expect(f.actions().selectedIds).toEqual([]);
    await f.actions().initialize();
    for (const id of ["0", "0", "unknown", "1", "2", "3"])
      f.actions().addIngredient(id);
    expect(f.actions().selectedIds).toEqual(["0", "1", "2"]);
    expect(selectCanBrew(f.actions())).toBe(true);
    f.actions().removeIngredient("1");
    expect(selectCanBrew(f.actions())).toBe(false);
    f.store.setState({ selectedIds: ["0", "1", "missing"] });
    await f.actions().brew();
    expect(f.brew).not.toHaveBeenCalled();
    f.cancelPending();
  });
  it("locks all editing synchronously and captures attempt until reset", async () => {
    const f = fixture();
    const pending = deferred<BrewResult>();
    f.brew.mockImplementation(() => pending.promise);
    await f.actions().initialize();
    for (const id of ["0", "1", "2"]) f.actions().addIngredient(id);
    const first = f.actions().brew();
    const duplicate = f.actions().brew();
    f.actions().removeIngredient("0");
    f.actions().addIngredient("3");
    f.actions().startNewBrew();
    await f.actions().changeLanguage("en");
    expect(f.actions().language).toBe("ua");
    expect(f.actions().selectedIds).toEqual(["0", "1", "2"]);
    expect(f.brew).toHaveBeenCalledTimes(1);
    expect(f.brew.mock.calls[0][0]).toEqual({
      ingredientIds: ["0", "1", "2"],
      language: "ua",
    });
    pending.resolve({ status: "useless" });
    await Promise.all([first, duplicate]);
    f.actions().removeIngredient("0");
    await f.actions().changeLanguage("en");
    expect(f.actions().brewing.phase).toBe("complete");
    expect(f.actions().selectedIds).toHaveLength(3);
    expect(f.actions().language).toBe("ua");
    f.actions().startNewBrew();
    expect(f.actions().selectedIds).toEqual([]);
    expect(f.actions().brewing).toEqual({ phase: "editing", error: null });
    f.cancelPending();
  });
  it("preserves selection after technical error and allows explicit retry", async () => {
    const f = fixture();
    f.brew.mockRejectedValueOnce(new HttpError(429));
    await f.actions().initialize();
    for (const id of ["0", "1", "2"]) f.actions().addIngredient(id);
    await f.actions().brew();
    expect(f.actions().brewing).toEqual({
      phase: "editing",
      error: "rate_limit",
    });
    expect(f.actions().selectedIds).toEqual(["0", "1", "2"]);
    expect(f.brew).toHaveBeenCalledTimes(1);
    await f.actions().brew();
    expect(f.actions().brewing.phase).toBe("complete");
    expect(f.brew).toHaveBeenCalledTimes(2);
    f.cancelPending();
  });
  it("ignores obsolete catalog responses and preserves selected ids across languages", async () => {
    const f = fixture();
    await f.actions().initialize();
    f.actions().addIngredient("0");
    const old = deferred<ReturnType<typeof snapshot>>();
    f.load.mockImplementationOnce(() => old.promise);
    const en = f.actions().changeLanguage("en");
    expect(selectCanBrew(f.actions())).toBe(false);
    await f.actions().changeLanguage("ua");
    old.resolve(snapshot("en"));
    await en;
    expect(f.actions().catalog).toMatchObject({
      status: "ready",
      data: { language: "ua" },
    });
    expect(f.actions().selectedIds).toEqual(["0"]);
    f.cancelPending();
  });
  it("catalog failure requires an explicit retry", async () => {
    const f = fixture();
    f.load.mockRejectedValueOnce(new Error("offline"));
    await f.actions().initialize();
    expect(f.actions().catalog.status).toBe("error");
    expect(f.load).toHaveBeenCalledTimes(1);
    await f.actions().retryCatalog();
    expect(f.actions().catalog.status).toBe("ready");
    f.cancelPending();
  });
  it("cancellation prevents a late brew response changing disposed state", async () => {
    const f = fixture();
    const pending = deferred<BrewResult>();
    f.brew.mockImplementation(() => pending.promise);
    await f.actions().initialize();
    for (const id of ["0", "1", "2"]) f.actions().addIngredient(id);
    const request = f.actions().brew();
    f.cancelPending();
    pending.resolve({ status: "useless" });
    await request;
    expect(f.actions().brewing.phase).toBe("brewing");
  });
  it("timeout unlocks selection without automatically repeating generation", async () => {
    vi.useFakeTimers();
    const load = async (language: Language) => snapshot(language);
    const brew = vi.fn<typeof brewPotion>(
      async (_attempt, _items, signal): Promise<BrewResult> =>
        new Promise((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const f = createLaboratoryStore({ load, brew });
    await f.store.getState().initialize();
    for (const id of ["0", "1", "2"]) f.store.getState().addIngredient(id);
    const request = f.store.getState().brew();
    await vi.advanceTimersByTimeAsync(60000);
    await request;
    expect(f.store.getState().brewing).toEqual({
      phase: "editing",
      error: "timeout",
    });
    expect(brew).toHaveBeenCalledTimes(1);
    f.cancelPending();
  });
});
