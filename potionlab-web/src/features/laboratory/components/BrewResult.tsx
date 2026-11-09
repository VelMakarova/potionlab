import { copy } from "../../../shared/i18n";
import type { Language } from "../../../shared/i18n/types";
import type { BrewingState, BrewError } from "../model/types";
const errorCopy = {
  rate_limit: "rateLimit",
  invalid_selection: "inputError",
  unavailable: "unavailable",
  timeout: "error",
  invalid_response: "error",
  network: "error",
} as const satisfies Record<BrewError, keyof typeof copy.ua>;
export function BrewResult({
  brewing,
  language,
}: {
  brewing: BrewingState;
  language: Language;
}) {
  const t = copy[language];
  let text = t.emptyResult;
  if (brewing.phase === "brewing") text = t.brewing;
  if (brewing.phase === "complete")
    text =
      brewing.result.status === "brewed"
        ? brewing.result.description
        : t[brewing.result.status];
  const error = brewing.phase === "editing" ? brewing.error : null;
  return (
    <section className="result" aria-labelledby="result-title">
      <h2 id="result-title">{t.result}</h2>
      <div
        className="result-description"
        tabIndex={0}
        role="region"
        aria-label={t.result}
        aria-live="polite"
      >
        {error ? <p role="alert">{t[errorCopy[error]]}</p> : <p>{text}</p>}
      </div>
    </section>
  );
}
