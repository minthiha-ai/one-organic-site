// Fills Vercel's edge cache for the shop's catalog and images, so the first
// real visitor after a deploy doesn't wait on the slow Bluehost API host.
//
// Why this is a function and not a script in CI: each Vercel region keeps its
// own cache, and Thai visitors are served from Singapore (sin1). A GitHub
// runner is in the US and would warm the wrong region. vercel.json pins
// functions to sin1, so the requests below leave from Singapore and land on
// the Singapore edge. The GitHub workflow .github/workflows/warm-cache.yml
// calls this after every production deploy.
//
// Requests must look like a browser's: the API sends "Vary: Accept-Encoding",
// so an entry warmed without a browser-style Accept-Encoding is a different
// cache entry from the one real visitors use (confirmed — the plain request
// stayed a MISS for the browser).
//
// Safe to expose: it takes no input, and everything it requests is already
// public. Repeat calls only produce cache HITs; a cold entry reaches Bluehost
// at most once per cache lifetime, same as ordinary traffic.

const ORIGIN = 'https://one-organic.com';
const ENCODINGS = ['gzip, deflate, br, zstd', 'gzip, deflate, br'];
const CONCURRENCY = 5;

async function warmOne(path, encoding) {
  const started = Date.now();
  try {
    const res = await fetch(`${ORIGIN}${path}`, {
      headers: { 'Accept-Encoding': encoding, Accept: '*/*', 'User-Agent': 'one-organic-cache-warmup' },
    });
    const body = await res.arrayBuffer();
    return {
      path,
      status: res.status,
      cache: res.headers.get('x-vercel-cache'),
      region: (res.headers.get('x-vercel-id') ?? '').split('::')[0],
      bytes: body.byteLength,
      ms: Date.now() - started,
      body,
    };
  } catch (err) {
    return { path, status: 0, cache: null, error: err.message, ms: Date.now() - started };
  }
}

async function runPool(items, worker) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) await worker(queue.shift());
    })
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // The list drives everything else: slugs for the per-product pages and the
  // image URLs the shop and product pages actually request.
  const list = await warmOne('/catalog-api/products', ENCODINGS[0]);
  if (list.status !== 200) {
    res.status(502).json({ ok: false, step: 'products', status: list.status, error: list.error ?? null });
    return;
  }

  const products = JSON.parse(Buffer.from(list.body).toString('utf8')).data ?? [];
  const storagePrefix = /^https?:\/\/[^/]+\/storage\//;
  const paths = ['/catalog-api/categories'];
  for (const product of products) {
    paths.push(`/catalog-api/products/${product.slug}`);
    for (const variant of product.variants ?? []) {
      for (const url of [variant.thumb_url, variant.image_url]) {
        if (url && storagePrefix.test(url)) paths.push(`/catalog-storage/${url.replace(storagePrefix, '')}`);
      }
    }
  }

  const results = [{ ...list, body: undefined }];
  await runPool([...new Set(paths)], async (path) => {
    // Only the JSON varies by Accept-Encoding (it's compressed); the WebP
    // images aren't, so one request each keeps a fully cold run well inside
    // the function's time limit.
    const encodings = path.startsWith('/catalog-storage/') ? ENCODINGS.slice(0, 1) : ENCODINGS;
    for (const encoding of encodings) {
      const result = await warmOne(path, encoding);
      results.push({ ...result, body: undefined });
    }
  });
  const failed = results.filter((r) => r.status !== 200);
  const counts = results.reduce((acc, r) => ({ ...acc, [r.cache ?? 'none']: (acc[r.cache ?? 'none'] ?? 0) + 1 }), {});

  res.status(failed.length === 0 ? 200 : 207).json({
    ok: failed.length === 0,
    // Lets the workflow confirm this ran on the deployment it just shipped,
    // not the previous one still behind the production domain.
    deploymentSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    functionRegion: process.env.VERCEL_REGION ?? null,
    edgeRegions: [...new Set(results.map((r) => r.region).filter(Boolean))],
    requests: results.length,
    cache: counts,
    failed: failed.map((r) => ({ path: r.path, status: r.status, error: r.error ?? null })),
  });
}
