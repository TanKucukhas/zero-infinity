import { getCloudflareContext as getCloudflareContextFromOpenNext } from '@opennextjs/cloudflare';

export function getCloudflareContext() {
  return getCloudflareContextFromOpenNext();
}
