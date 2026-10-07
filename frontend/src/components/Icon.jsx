import { useEffect } from 'react';
import icons from '../assets/icons.json';

// Tabler icon, drawn as an inline SVG so no icon font or stylesheet is needed
// to paint a page. The shapes live in src/assets/icons.json; add one with
// `npm run icons -- <name>` (Tabler's name without the "ti-" prefix).
//
// Product "Ways to use" icons are typed into the admin as free text ("Tabler
// icon name, e.g. ti-flame"), so a name outside that file must still work:
// those render as the icon font and trigger its stylesheet, loaded on demand
// and only then. Keep this version equal to TABLER_VERSION in
// scripts/add-icons.mjs so both draw the same glyphs.
const FALLBACK_CSS = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.49.0/dist/tabler-icons.min.css';

function loadFallbackFont() {
  if (typeof document === 'undefined' || document.getElementById('tabler-fallback-font')) return;
  const link = document.createElement('link');
  link.id = 'tabler-fallback-font';
  link.rel = 'stylesheet';
  link.href = FALLBACK_CSS;
  document.head.appendChild(link);
}

// Accepts "flame", "ti-flame" or "ti ti-flame".
function normalize(name) {
  return String(name).trim().split(/\s+/).pop().replace(/^ti-/, '');
}

// The wrapper is an <i> sized 1em x 1em, like the font glyph it replaces, so
// the callers' font-size / color / vertical-align and the stylesheet's
// `.v2-tag i` rules apply unchanged; the SVG fills it and takes the text color.
export default function Icon({ name, className, style }) {
  const key = normalize(name);
  const shapes = icons[key];

  useEffect(() => {
    if (!shapes) loadFallbackFont();
  }, [shapes]);

  if (!shapes) {
    return <i className={`ti ti-${key}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true" />;
  }

  // The icon font's glyph box hangs 0.115em below the text baseline; this box
  // sits on it. Shifting by that much — on top of any vertical-align the
  // caller passes, which was tuned against the font — keeps inline icons
  // exactly where they were. (Ignored by flex/grid parents, as before.)
  const { verticalAlign, ...rest } = style ?? {};
  const alignment =
    verticalAlign === undefined
      ? '-0.115em'
      : typeof verticalAlign === 'number'
        ? `calc(${verticalAlign}px - 0.115em)`
        : verticalAlign;

  return (
    <i
      className={className}
      style={{
        display: 'inline-block',
        // Never shrink inside a flex row: the font glyph had a fixed advance
        // width, but an empty SVG box would collapse next to a long label.
        flexShrink: 0,
        width: '1em',
        height: '1em',
        lineHeight: 1,
        fontStyle: 'normal',
        verticalAlign: alignment,
        ...rest,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
        dangerouslySetInnerHTML={{ __html: shapes }}
      />
    </i>
  );
}
