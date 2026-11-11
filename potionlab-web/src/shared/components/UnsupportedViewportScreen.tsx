import { copy } from '../i18n';

export function UnsupportedViewportScreen() {
  return <p className="unsupported">{copy.ua.mobile}</p>;
}
