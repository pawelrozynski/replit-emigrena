// Pomocnicza funkcja do określania bazowego URL API
export function getApiUrl(path: string): string {
  const apiPath = path.startsWith('/') ? path : `/${path}`;

  // W środowisku produkcyjnym (Netlify) używamy funkcji Netlify
  if (import.meta.env.PROD) {
    return `/.netlify/functions/api${apiPath}`;
  }

  // W środowisku developerskim używamy lokalnego serwera
  return `/api${apiPath}`;
}