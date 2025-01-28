export function getApiUrl(path: string): string {
  // Usuń leading slash jeśli istnieje
  const apiPath = path.startsWith('/') ? path.substring(1) : path;

  // W trybie developerskim używamy lokalnego serwera Express
  if (import.meta.env.DEV) {
    return `/api/${apiPath}`;
  }

  // W produkcji używamy Netlify Functions
  return `/.netlify/functions/${apiPath}`;
}
