export type DbSource = 'mock' | 'sqlite' | 'prod';

export function getCurrentDbSource(env: any): DbSource {
  const wanted = (process.env.DB_SOURCE || 'sqlite').toLowerCase();
  if (wanted === 'mock') return 'mock';
  if (wanted === 'prod') return env && env.DB ? 'prod' : 'sqlite';
  return 'sqlite';
}

export const isMockMode = (env: any) => getCurrentDbSource(env) === 'mock';



