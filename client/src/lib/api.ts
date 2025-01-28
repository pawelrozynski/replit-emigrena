export function getApiUrl(path: string): string {
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}/api${apiPath}`;
}