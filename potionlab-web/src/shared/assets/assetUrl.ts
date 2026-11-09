import { assetBaseUrl } from "../api/config";
export function assetUrl(path: string) {
  return `${assetBaseUrl}/${path.replace(/^\/+/, "")}`;
}
