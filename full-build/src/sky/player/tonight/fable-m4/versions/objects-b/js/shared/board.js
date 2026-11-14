/* Rings <-> m4 Objects board wiring. A version root sits at fable-m4/objects-3d/, so the m4 site is '../'.
 - Into the room: the m4 site links to objects-3d/#<ring id> (e.g. #joio-cup) or objects-3d/?from=<board slug>.
 entry turns either into { ring, layer, i }. A board slug maps to the ring that photographs that object.
 - Back out: boardUrl is the Objects board (#objects/board); cardUrl(slug) opens that card on the board;
 homeUrl is the site root. Each ring lists its board cards in SPECIMENS[].board (joio cup has 7; the others have none on the board yet).
 - keep(state) writes #ring/layer/i with replaceState so Back from a card returns to the same place. */
import { SPECIMENS, BOARD } from './objects-data.js';
export const SITE = '../../';
export const boardUrl = () => SITE + '#objects/board';
export const cardUrl = slug => SITE + '#objects/' + slug;
export const homeUrl = () => SITE;
export const chapterUrl = () => SITE + '#objects';
export const boardCard = slug => BOARD.find(b => b.slug === slug) || null;
export const cardsOf = id => { const s = SPECIMENS.find(x => x.id === id); return s ? s.board.map(boardCard).filter(Boolean) : [] };
export function ringOfSlug(slug) { const s = SPECIMENS.find(x => x.board.includes(slug)); return s ? s.id : null }
export function entry(loc = location) {
  const q = new URLSearchParams(loc.search), from = q.get('from');
  const h = decodeURIComponent((loc.hash || '').slice(1)).split('/');
  let ring = SPECIMENS.some(s => s.id === h[0]) ? h[0] : (from ? ringOfSlug(from) : null);
  const idx = Math.max(0, SPECIMENS.findIndex(s => s.id === ring));
  return { ring: SPECIMENS[idx].id, index: idx, layer: ring && h[1] ? h[1] : null, i: ring && h[2] ? (+h[2] || 0) : 0, from: from || null, explicit: !!ring };
}
export function keep(ring, layer, i) { const h = '#' + ring + (layer ? '/' + layer + (i ? '/' + i : '') : ''); if (location.hash !== h) history.replaceState(null, '', h) }
