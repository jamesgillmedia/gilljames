/* The only place that names photos, titles and captions. Everything here comes from the repo:
   - titles: u4-opus-m4/_sketch/objects/rings/MANIFEST.json (joio cup, ice cream scoop)
   - captions: that manifest's per-photo descriptions, u4-opus-m4/media/nov9/manifest.json ("reason" / "likely_object"),
     u4-opus-m4/data.json titles (hand-carved piece, carved spoon), and OBJECT-COVERAGE.md (e2aa7ba0 "close on the speckled wall")
   - a frame with no repo caption shows only its file stem.
   Files live in media/ (built by tools/build_media.py and tools/cutout.py, EXIF/GPS stripped). Whole-piece frames are alpha cutouts (`cut`);
   sit:false means the piece floats (soft shadow below, not touching).
   Order inside making/use: the camera's own file counter (IMG_xxxx) where there is one; files without a counter come after.
   No capture timestamps survive in the repo (EXIF is already stripped upstream), so the counter is the only real order available.

   Layer order is fixed: whole, surface, making, use, shop. A layer with no frames is skipped (not faked). */
export const LAYERS = [
  { k: 'whole', name: 'whole piece' },
  { k: 'surface', name: 'surface' },
  { k: 'making', name: 'making' },
  { k: 'use', name: 'use' },
  { k: 'shop', name: 'shop' }
];

const f = (img, stem, cap, extra) => Object.assign({ img: 'media/' + img + '.webp', stem, cap: cap || '' }, extra);
/* focus: where on the PREVIOUS stop's frame this one grows out of (0-1, 0-1). Used only for the sideways drift of the dolly. */

export const SPECIMENS = [
  {
    id: 'joio-cup', title: 'joio cup',
    layers: {
      whole: [f('joio-cup/cut-IMG_5841', 'IMG_5841', 'Empty joio cup held up at a three-quarter angle.', { cut: true })],
      surface: [
        f('joio-cup/surface-IMG_5841', 'IMG_5841', '', { crop: true, focus: [.5, .33] }),
        f('joio-cup/surface-e2aa7ba0', 'e2aa7ba0', 'Close on the speckled wall.', { crop: true }),
        f('joio-cup/surface-IMG_5892', 'IMG_5892', '', { crop: true }),
        f('joio-cup/surface-IMG_5901', 'IMG_5901', '', { crop: true })
      ],
      making: [
        f('joio-cup/making-IMG_0183', 'IMG_0183', 'paddle close grain'),
        f('joio-cup/making-IMG_0346', 'IMG_0346', 'single paddle, product view'),
        f('joio-cup/making-IMG_2351', 'IMG_2351'),
        f('joio-cup/making-IMG_2401', 'IMG_2401'),
        f('joio-cup/making-IMG_3497', 'IMG_3497', 'long dark paddle against a wall'),
        f('joio-cup/making-IMG_3506', 'IMG_3506'),
        f('joio-cup/making-IMG_5881', 'IMG_5881', 'Empty joio cup held in hand, side view against a white wall.'),
        f('joio-cup/making-IMG_5892', 'IMG_5892', 'Looking straight into the empty joio cup, held in hand.'),
        f('joio-cup/making-IMG_5901', 'IMG_5901', 'Looking into the empty joio cup, held at a high three-quarter angle.'),
        f('joio-cup/making-2528243E', '2528243E', 'dark paddle in window light'),
        f('joio-cup/making-1724F546', '1724F546', 'long dark paddle in hand'),
        f('joio-cup/making-carve', 'carve', 'hand-carved piece'),
        f('joio-cup/making-spoon', 'spoon', 'carved spoon')
      ],
      use: [
        f('joio-cup/use-IMG_0952', 'IMG_0952', 'Joio cup with a latte on a wooden board, three-quarter view in window light.'),
        f('joio-cup/use-IMG_5925', 'IMG_5925', 'Joio cup held in hand, filled with a layered pink drink.'),
        f('joio-cup/use-IMG_6136', 'IMG_6136', 'Joio cup with a latte on a stone counter, three-quarter view.'),
        f('joio-cup/use-IMG_6166', 'IMG_6166', 'Joio cup with a latte, held in hand against wood siding.'),
        f('joio-cup/use-IMG_9126', 'IMG_9126', 'Speckled joio cup with a latte, sitting on a dark board.'),
        f('joio-cup/use-16B39E13', '16B39E13', 'Speckled joio cup with a latte, on a stone table among other bowls.')
      ],
      shop: [{ slot: true }]
    }
  },
  {
    id: 'scoop', title: 'ice cream scoop',
    layers: {
      whole: [f('scoop/cut-SCOOP-03', 'SCOOP-03', 'Frontal view of the full bowl and the join to the charred, ridged handle.', { cut: true, sit: false })],
      surface: [
        f('scoop/surface-bowl-SCOOP-03', 'SCOOP-03', '', { crop: true, focus: [.5, .25] }),
        f('scoop/surface-side-SCOOP-04', 'SCOOP-04', '', { crop: true }),
        f('scoop/surface-handle-SCOOP-03', 'SCOOP-03', '', { crop: true })
      ],
      making: [],
      use: [],
      shop: [{ slot: true }]
    }
  }
];

/* flat list of stops along the one axis for a specimen: [{layer, name, i, n, frame}] */
export function stopsOf(spec) {
  const out = [];
  LAYERS.forEach(L => { if (L.k === 'shop') return; /* m4: the empty shop layer stays hidden until it is real */ const fr = spec.layers[L.k] || []; fr.forEach((frame, i) => out.push({ layer: L.k, name: L.name, i, n: fr.length, frame })) });
  return out;
}
