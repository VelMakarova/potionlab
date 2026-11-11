import { describe, expect, it, vi, afterEach } from 'vitest';
import { requestBrew } from '../shared/api/brewingApi';

afterEach(() => vi.unstubAllGlobals());
describe('brew contract', () => {
  it('sends only ids and attempt language and accepts a result', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'brewed',
        description: 'Potion',
        properties: { healing: 3 },
      }),
    });
    vi.stubGlobal('fetch', fetch);
    expect(
      await requestBrew(['a', 'b', 'c'], 'ua', new AbortController().signal)
    ).toEqual({ status: 'brewed', description: 'Potion' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/brew?lang=ua',
      expect.objectContaining({
        body: JSON.stringify({ ingredientIds: ['a', 'b', 'c'] }),
      })
    );
  });
  it.each([
    {},
    null,
    { status: 'brewed' },
    { status: 'brewed', description: 'Potion', properties: { healing: -1 } },
  ])('rejects malformed responses %j', async (data) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => data })
    );
    await expect(
      requestBrew(['a', 'b', 'c'], 'en', new AbortController().signal)
    ).rejects.toThrow();
  });
});
