import { Picture } from '../../../shared/components/Picture';
import { cauldronPlaceholder } from '../../../shared/assets/placeholders';
import { copy } from '../../../shared/i18n';
import type { Language } from '../../../shared/i18n/types';
import type { BrewingState, FailedImages } from '../model/types';

export function Cauldron({
  phase,
  language,
  failed,
}: {
  phase: BrewingState['phase'];
  language: Language;
  failed: FailedImages;
}) {
  const t = copy[language];

  return (
    <section
      className="cauldron pl-frame pl-panel-background"
      aria-labelledby="cauldron-title"
    >
      <Picture
        src={cauldronPlaceholder}
        size={160}
        alt={t.cauldron}
        failed={failed}
      />
      <p role="status">
        {phase === 'brewing'
          ? t.brewing
          : phase === 'complete'
            ? t.result
            : t.ready}
      </p>
    </section>
  );
}
