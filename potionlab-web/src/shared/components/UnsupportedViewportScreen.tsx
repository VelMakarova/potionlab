import { copy } from "../i18n";
export function UnsupportedViewportScreen() {
  return (
    <main className="unsupported" lang="uk">
      <h1>PotionLab</h1>
      <p>{copy.ua.mobile}</p>
    </main>
  );
}
