export function getApiUrl(path: string): string {
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `/.netlify/functions/api${apiPath}`;
}