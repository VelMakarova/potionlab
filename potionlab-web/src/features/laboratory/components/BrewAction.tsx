import { useShallow } from "zustand/react/shallow";
import { copy } from "../../../shared/i18n";
import { selectCanBrew, selectEditingAllowed } from "../model/selectors";
import { useLaboratoryStore } from "../model/useLaboratoryStore";
export function BrewAction({ newCycle }: { newCycle: () => void }) {
  const { language, brewing, locked, canBrew, brew, reset } =
    useLaboratoryStore(
      useShallow((state) => ({
        language: state.language,
        brewing: state.brewing,
        locked: !selectEditingAllowed(state),
        canBrew: selectCanBrew(state),
        brew: state.brew,
        reset: state.startNewBrew,
      })),
    );
  const t = copy[language];
  const complete = brewing.phase === "complete";
  const title = complete
    ? t.another
    : brewing.phase === "brewing"
      ? t.brewing
      : brewing.error
        ? t.retry
        : t.brew;
  function activate() {
    if (complete) {
      reset();
      newCycle();
    } else void brew();
  }
  return (
    <div className="brew-action">
      <p>{locked ? t.locked : t.choose}</p>
      <button disabled={!complete && !canBrew} onClick={activate}>
        {title}
      </button>
    </div>
  );
}
