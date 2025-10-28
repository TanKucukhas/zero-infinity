import { getCloudflareContext as getCloudflareContextFromOpenNext } from '@opennextjs/cloudflare';

export async function getCloudflareContext() {
  return getCloudflareContextFromOpenNext({ async: true });
}
