import { loadIngredients } from '../../../shared/api/ingredientsApi';
import { assetUrl } from '../../../shared/assets/assetUrl';
import { preloadImage } from '../../../shared/assets/imageLoader';
import {
  cauldronPlaceholder,
  placeholder,
} from '../../../shared/assets/placeholders';
import type { Language } from '../../../shared/i18n/types';
import type { CatalogSnapshot, FailedImages } from '../model/types';
export async function loadLaboratory(
  language: Language,
  signal: AbortSignal
): Promise<{ data: CatalogSnapshot; failedImageUrls: FailedImages }> {
  const items = await loadIngredients(language, signal);
  const urls = [
    ...new Set(
      items.flatMap((item) => [
        assetUrl(item.assets.thumb64),
        assetUrl(item.assets.thumb128),
      ])
    ),
  ];
  urls.push(
    cauldronPlaceholder,
    placeholder(64),
    placeholder(128),
    placeholder(480)
  );
  const results = await Promise.all(
    urls.map(async (url) => [url, await preloadImage(url)] as const)
  );
  return {
    data: {
      language,
      ids: items.map((item) => item.id),
      byId: Object.fromEntries(items.map((item) => [item.id, item])),
    },
    failedImageUrls: Object.fromEntries(
      results
        .filter(([, success]) => !success)
        .map(([url]) => [url, true as const])
    ),
  };
}
