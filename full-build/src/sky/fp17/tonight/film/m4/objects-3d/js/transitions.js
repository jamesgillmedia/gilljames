/* How one specimen gives way to the next. SWAP POINT.
 A transition is async (view, from, to, stop, onSwitch) -> void where from / to are specimen indexes, stop the stop to land on,
 and onSwitch is called at the moment the new specimen takes over (nav updates its label there).
 Current: a simple dissolve on the same dark ground: the old specimen fades out, the camera is placed on the first stop
 of the new one, the new one fades in.
 Every specimen already sits at its own x in the scene (view.specX), so a camera glide can replace this later:
 tween the camera x from view.specX(from) to view.specX(to) while both specimens cross-fade, with no change to nav.js.
 Nothing here depends on the layers. */
export async function dissolve(view, from, to, stop, onSwitch) {
  await view.fade(from, 0, 420);
  view.place(to, stop || 0); if (onSwitch) onSwitch();
  await view.fade(to, 1, 520);
}
export const TRANSITION = dissolve;
