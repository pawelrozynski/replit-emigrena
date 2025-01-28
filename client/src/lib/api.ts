// Pomocnicza funkcja do określania bazowego URL API
export function getApiUrl(path: string): string {
  // W środowisku produkcyjnym (Netlify) używamy funkcji Netlify
  if (import.meta.env.PROD) {
    return `/.netlify/functions/api${path}`;
  }
  // W środowisku developerskim używamy lokalnego serwera
  return `/api${path}`;
}
