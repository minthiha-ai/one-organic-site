import { useEffect } from 'react';
import { endHydration } from '../lib/prerender.js';

// Rendered last in the tree (src/main.jsx): its effect runs once the root
// pass has hydrated. Content inside a <Suspense> boundary can hydrate later,
// so for product pages the variant hint is ended by ProductDetail instead
// (see endHydration / consumeHydrationHint in src/lib/prerender.js).
export default function HydrationDone() {
  useEffect(() => endHydration(), []);
  return null;
}
