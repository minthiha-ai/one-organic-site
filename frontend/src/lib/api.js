const API_URL = import.meta.env.VITE_API_URL ?? 'http://one-organic-backend.test/api';

// In production the public catalog is read through same-origin paths that
// Vercel proxies to the API host (see vercel.json) and caches at its edge.
// The Bluehost host answers in several seconds, so going to it directly makes
// every shop visit wait on it. In dev (and anywhere the proxy paths don't
// exist) these stay on the real API so nothing needs extra setup.
const USE_CATALOG_PROXY = import.meta.env.PROD;
const CATALOG_PROXY_URL = '/catalog-api';
const STORAGE_PROXY_URL = '/catalog-storage';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// Product image URLs come back from the API as absolute links to the API
// host's /storage; route them through the same edge cache as the catalog.
// Anything else (a different host, a relative URL, null) passes through.
export function assetUrl(url) {
  const prefix = `${API_ORIGIN}/storage/`;
  if (USE_CATALOG_PROXY && typeof url === 'string' && url.startsWith(prefix)) {
    return `${STORAGE_PROXY_URL}/${url.slice(prefix.length)}`;
  }
  return url;
}

const TOKEN_KEY = 'one_organic_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors ?? {};
  }
}

async function request(path, { method = 'GET', body, auth = true, baseUrl = API_URL } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  // Only matters when API_URL points at an ngrok tunnel (local HTTPS testing
  // for Xendit Components), where it skips ngrok's free-tier browser-warning
  // interstitial. Sent only then because any non-standard request header
  // forces the browser to make a separate CORS preflight request first — and
  // against the production API host that doubled every call's wait.
  if (API_URL.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.errors
    );
  }

  return payload;
}

// Public catalog reads: via the edge-cached proxy first, then straight to the
// API if the proxy is unreachable, errors (5xx), or isn't deployed (it would
// answer with the SPA's HTML instead of JSON). A real API answer — including
// a JSON 404 for an unknown product — is returned as-is, never retried.
async function catalogGet(path) {
  if (!USE_CATALOG_PROXY) return request(path, { auth: false });

  try {
    const payload = await request(path, { auth: false, baseUrl: CATALOG_PROXY_URL });
    if (payload !== null) return payload;
  } catch (err) {
    if (err instanceof ApiError && err.status < 500) throw err;
  }
  return request(path, { auth: false });
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  getCatalog: catalogGet,
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
