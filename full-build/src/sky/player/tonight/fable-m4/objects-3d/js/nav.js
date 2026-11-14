/* Navigation state: which specimen, which stop. No three.js here.
 Rules:
 - one gesture = exactly one step; while a move or transition runs every other gesture is ignored (no queue, no skipping)
 - deeper / up change the stop by exactly 1 and clamp at the ends (nothing happens at the first or last stop)
 - next / prev specimen go one specimen, no wrap, and land on that specimen's first stop (whole piece)
 - home goes to the first specimen's whole piece through the same transition as a specimen change */
export function createNav(SPECS, stopsOf, view, transition, ui) {
  const stops = SPECS.map(stopsOf);
  let spec = 0, stop = 0, busy = false;
  const info = () => { const st = stops[spec][stop]; return { spec, stop, n: stops[spec].length, title: SPECS[spec].title, layer: st.layer, name: st.name, i: st.i, cnt: st.n, frame: st.frame, nSpec: SPECS.length, busy } };
  function say() { ui.update(info()) }
  async function go(from, to) {
    if (busy || to < 0 || to >= stops[spec].length) return false;
    busy = true; ui.busy(true);
    await view.move(spec, from, to, () => { stop = to; say() });
    stop = to; busy = false; ui.busy(false); say(); return true;
  }
  async function swap(toSpec, toStop) {
    if (busy) return false; busy = true; ui.busy(true);
    const from = spec;
    await transition(view, from, toSpec, toStop, () => { spec = toSpec; stop = toStop; say() });
    spec = toSpec; stop = toStop; busy = false; ui.busy(false); say(); return true;
  }
  return {
    info,
    deeper: () => go(stop, stop + 1),
    up: () => go(stop, stop - 1),
    nextSpecimen: () => spec + 1 < SPECS.length ? swap(spec + 1, 0) : false,
    prevSpecimen: () => spec > 0 ? swap(spec - 1, 0) : false,
    home: () => (spec === 0 && stop === 0) ? false : swap(0, 0),
    start() { view.place(0, 0); view.show(0, 0); view.fade(0, 1, 700); say() }
  };
}
