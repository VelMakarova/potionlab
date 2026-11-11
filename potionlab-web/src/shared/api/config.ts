export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(
  /\/+$/,
  ''
);

export const assetBaseUrl = (
  import.meta.env.VITE_ASSET_BASE_URL || 'https://d1lssxnwjxws8p.cloudfront.net'
).replace(/\/+$/, '');
