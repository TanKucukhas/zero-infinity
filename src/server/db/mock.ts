export async function readMockJson<T>(name: string, requestUrl: string): Promise<T> {
  const url = new URL(`/mock/${name}.json`, requestUrl);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mock data fetch failed: ${url.toString()} (${res.status})`);
  }
  return (await res.json()) as T;
}


