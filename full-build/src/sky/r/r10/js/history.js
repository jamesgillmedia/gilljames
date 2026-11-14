/* one · earlier builds (Gill, Nov 11 5:49 PM): every previous build, the previews page first, newest first within each group (by each folder's latest commit on GitHub, read Nov 11 2026).
   Folder names are the labels; nothing else is claimed about them. Links open in a new tab. */
const GJ = 'https://jamesgillmedia.github.io/gilljames/', GS = 'https://jamesgillmedia.github.io/gill-sky/';
const L = (base, list) => list.map(f => [f, base + f + '/']);
export const HISTORY = [
  { g: 'hubs', items: L(GJ, ['previews', 'progress']) },
  { g: 'gill-sky', items: [...L(GS, ['u4-opus-m4', 'u4-opus-m4/3d', '_preview-cards', 'night-listening', 'u4-opus-m3', 'u4-opus-m2', 'u3-r3', 'u3-r2', 'u4-opus-m1', 'u3-preview', 'u3', 'u1m', 'u1', 'r11', 'r10', 'r9', 'r8', 'r7', 'r6', 'r5', 'r4'])] },
  { g: 'site builds', items: L(GJ, ['site-v3', 'site-constellation-r4', 'site-constellation-r3', 'site-constellation-r2', 'site-constellation', 'site-c', 'site-v3-pro2', 'site-v3-bio', 'site-v3-pro3', 'site-v3-pro', 'site-v4-c-pro', 'site-galaxy-world', 'site-v4-galaxy-nav', 'site-v4-galaxy', 'site-v5', 'site-v4-d', 'site-v4-c', 'site-v3-3d', 'site-3d', 'site-v4', 'site-v38', 'site-keep', 'site-flythrough', 'site-fast', 'site-v351', 'site-v2', 'gilljames-v1']) },
  { g: 'sound', items: L(GJ, ['sound-sketch', 'site-sound-one', 'sound-v2b', 'site-sound-open', 'sound-v2']) },
  { g: 'sketches', items: L(GJ, ['sketch-galaxy', 'sketch-3d-c', 'sketch-3d-b', 'sketch-3d', 'home-first', 'semantic-zoom']) },
  { g: 'nav', items: L(GJ, ['nav-overhaul', 'nav-visible', 'nav-water-sky', 'nav-concepts']) },
  { g: 'reels', items: L(GJ, ['reel-v7', 'reel-v6', 'reel-v5', 'reel-v4', 'reel-v3']) }
];
