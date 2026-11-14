/* one · the Spirit Eye brief as stops. Every word comes from 3d/js/se-pages.js (the PDF verbatim, "the the" on p.2 kept).
   One job per stop: a "tell" stop is a calm reading page (the world dims behind it); a "show" stop is a PDF plate placed in the
   3D space (the camera glides to face it). Order: the title + how-to, then the pages that say what the project is
   (DESCRIPTION p.6, its plates, the lens p.9, ARTIST STATEMENT p.5), then the rest in PDF order; BUDGET and COMMUNITY VALUE
   are moved to a labelled end section; the black-and-white pages 26-32 close as a tappable grid. All 32 pages are present. */
import { PAGES } from '../m4/3d/js/se-pages.js'; /* r10's own copy */
const PG = {}; PAGES.forEach(p => PG[p.n] = p);
export const PDF = 'm4/3d/media/spirit-eye/pdf/';
const tell = n => ({ kind: 'tell', n, page: PG[n] });
const show = (n, file) => { const p = PG[n], im = (p.img || []).find(i => i[0] === (file || p.img[0][0])); return { kind: 'show', n, page: p, img: im } };
const seq = [{ kind: 'title', n: 1, page: PG[1], img: PG[1].img[0] },
  tell(6), show(6, 'p06b'), show(6, 'p06'), show(9),
  tell(5), show(5),
  tell(2), show(2), tell(3), show(3), tell(4), show(4),
  show(7), show(8),
  tell(10), show(10), show(11), show(12), show(13), show(14),
  tell(15), show(15), show(16),
  tell(17), show(17), show(18), show(19), show(20),
  tell(21), show(21), tell(22), show(22), tell(23), show(23)];
const MAIN = seq.length;
seq.push({ kind: 'endsec', n: 24 }, { kind: 'tell', n: 24, page: PG[24], end: 1 }, show(24), { ...tell(25), end: 1 }, show(25));
seq.push({ kind: 'gallery', n: 26, pages: [26, 27, 28, 29, 30, 31, 32].map(n => PG[n]) });
seq.push({ kind: 'close', n: 1, page: PG[1] });
/* section label = the PDF heading of the page, or of the page the plate belongs to; image-only pages say only their page number */
let last = '';
seq.forEach((s, i) => { const h = s.page && s.page.h;
  if (s.kind === 'title' || s.kind === 'close') s.sec = PG[1].h;
  else if (s.kind === 'endsec') s.sec = PG[24].h + ' · ' + PG[25].h;
  else if (s.kind === 'gallery') s.sec = 'pp. 26–32';
  else if (h) s.sec = h;
  else s.sec = 'p. ' + s.n;
  s.i = i; s.main = i < MAIN });
export const STOPS = seq;
/* the contents list: one entry per section (the PDF's own headings) */
export function contents() { const out = []; STOPS.forEach((s, i) => { if (s.kind === 'show' && !s.page.h) return; if (s.kind === 'close') return; if (!out.length || out[out.length - 1].sec !== s.sec) out.push({ sec: s.sec, i, n: s.n }) }); return out }
export const SHOWS = STOPS.filter(s => s.kind === 'show' || s.kind === 'title');
