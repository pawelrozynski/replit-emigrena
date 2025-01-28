export function getApiUrl(path: string): string {
  // W trybie developerskim używamy lokalnego serwera Express
  return `/api/${path}`;
}