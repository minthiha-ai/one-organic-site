import { useEffect } from 'react';
import { endHydration } from '../lib/prerender.js';

// Rendered last in the tree (src/main.jsx): its effect runs only once the
// whole tree has hydrated, which is when the prerender's variant hint stops
// applying (see src/lib/prerender.js).
export default function HydrationDone() {
  useEffect(() => endHydration(), []);
  return null;
}
