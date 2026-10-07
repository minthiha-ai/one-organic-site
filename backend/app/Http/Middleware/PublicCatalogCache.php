<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Marks the public, read-only catalog endpoints as cacheable.
 *
 * Laravel defaults every response to "no-cache, private", which is right for
 * user data but means the storefront's CDN (Vercel proxies these routes, see
 * frontend/vercel.json) can never keep a copy — every shop visit then waits
 * on the shared Bluehost host, which answers in several seconds.
 *
 * s-maxage lets the CDN serve a copy for 5 minutes, and stale-while-revalidate
 * lets it keep serving that copy instantly while it refreshes in the
 * background, so visitors almost never wait on this server. The cost: a price
 * or stock change made in the admin can take up to ~5 minutes to show up.
 *
 * Only successful GETs are marked — errors (a 404 for an unknown slug, a 429
 * from the rate limiter) must never be cached and replayed to other visitors.
 */
class PublicCatalogCache
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('GET') && $response->getStatusCode() === 200) {
            $response->headers->set(
                'Cache-Control',
                'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
            );
        }

        return $response;
    }
}
