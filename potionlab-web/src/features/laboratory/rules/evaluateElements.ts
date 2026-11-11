import type { Ingredient } from '../../../shared/types/ingredient';
import type { Outcome } from '../../../shared/types/brewing';
export function evaluateElements(
  items: readonly Pick<Ingredient, 'element'>[]
): Exclude<Outcome, 'useless'> | 'compatible' {
  const elements = new Set(items.map((item) => item.element));
  if (elements.size === 1) return 'no_magic';
  if (elements.size === 2) {
    if (elements.has('fire') && elements.has('water')) return 'explosion';
    if (elements.has('earth') && elements.has('air')) return 'cracked';
    if (elements.has('light') && elements.has('dark')) return 'runaway';
  }
  return 'compatible';
}
