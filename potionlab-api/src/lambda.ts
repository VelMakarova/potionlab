// TODO: Wrap createApp() from ./app.js with a Lambda adapter when AWS is configured.
// Do not import bootstrap.ts here: Lambda must not open an HTTP listening port.
export async function handler(): Promise<never> {
  throw new Error('AWS Lambda integration is not configured yet.');
}
