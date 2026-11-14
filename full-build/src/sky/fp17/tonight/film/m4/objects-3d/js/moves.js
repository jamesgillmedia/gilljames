/* How the camera travels between two stops of the SAME specimen. SWAP POINT.
 A move maps a progress value s (a float: 0 = first stop, 1 = second stop, 2 = third ...) to what is visible.
 Current move: a straight dolly along one axis (z) into the specimen, with a small sideways drift toward the
 point a frame grows out of. Frames cross-fade by distance so only one frame is ever fully visible, at a stop,
 and nothing from another layer shows through.

 Interface used by view.js:
 SP distance between frames along the axis (world units)
 alpha(d) opacity of a frame whose distance from the camera, in stops, is d (0 at a stop for the frame you are on)
 ease(t) timing curve 0..1 -> 0..1 (no overshoot allowed: the result must stay inside 0..1)
 duration ms for one stop */
export const dolly = {
  SP: 6,
  duration: 900,
  alpha(d) { const x = Math.min(1, Math.max(0, (.75 - d) / .5)); return x * x * (3 - 2 * x) },
  ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }
};
export const MOVE = dolly;
