import { expect, test } from '@playwright/test';
import { evaluateBrew } from '../../potionlab-api/src/domain/brewing';
import { evaluateElements } from '../src/features/laboratory/rules/evaluateElements';
const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark'] as const;

test('local elemental rules match backend for all 216 ordered triples', () => {
  for (const a of elements)
    for (const b of elements)
      for (const c of elements) {
        const items = [a, b, c].map((element, index) => ({
          id: String(index),
          element,
          properties: ['healing' as const],
        }));
        const status = evaluateBrew(items).status;

        expect(evaluateElements(items)).toBe(
          status === 'ready_for_generation' ? 'compatible' : status
        );
      }
});
