export function getApiUrl(path: string): string {
  const apiPath = path.startsWith('/') ? path : `/${path}`;

  // W trybie developerskim używamy lokalnego serwera Express
  if (import.meta.env.DEV) {
    return `${window.location.origin}${apiPath}`;
  }

  // W produkcji używamy Netlify Functions
  return `/.netlify/functions/api${apiPath}`;
}