import { useShallow } from "zustand/react/shallow";
import { selectFailedImages } from "../model/selectors";
import { useLaboratoryStore } from "../model/useLaboratoryStore";
import { Cauldron } from "./Cauldron";
import { BrewResult } from "./BrewResult";
import { SelectedIngredients } from "./SelectedIngredients";
import { BrewAction } from "./BrewAction";
export function BrewingWorkspace({ newCycle }: { newCycle: () => void }) {
  const { brewing, language, failed } = useLaboratoryStore(
    useShallow((state) => ({
      brewing: state.brewing,
      language: state.language,
      failed: selectFailedImages(state),
    })),
  );
  return (
    <section className="workspace" aria-label="PotionLab">
      <Cauldron phase={brewing.phase} language={language} failed={failed} />
      <BrewResult brewing={brewing} language={language} />
      <SelectedIngredients />
      <BrewAction newCycle={newCycle} />
    </section>
  );
}
