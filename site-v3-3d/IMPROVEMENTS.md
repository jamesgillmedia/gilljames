# site-v3-3d proposals

These are design notes from the debug pass. They are not built. The pass only fixed broken behaviour.

## 1. There is no Spaces room

The dock is Film, Photo, Objects, Sound, and About. "Spaces" appears in the bio sentence and nowhere else, so a visitor who looks for a Spaces room has no door.

## 2. The sky painting is still brighter than the cap, and some stars read as mint

Chrome text and controls are held to #e8e4dc. The constellation is drawn on a canvas. The photo cluster is painted green (170, 245, 212), which is brighter than the cap and reads as mint. Changing those paints is a picture change, not a bug fix.

## 3. The tune drawer is the constellation drawer, not Darkroom

The mark opens the current drawer: mood, depth, colour, and the ghost-arc dial. The older Darkroom reference (strength, edge-only safelight) is a different design. Swapping it in would throw away the drawer that is live now.

## 4. Captions are still waiting on Gill

Where a film or object had the public line "[Gill writes]", that line is now hidden. The credit block stays empty until Gill writes the real caption. One With the Devil and the Arc line in the About bio were left as they are.

## 5. One Sound card still says YouTube

The Lost Coffee card's small line still says YouTube. Tapping it opens the waveform player on this site and does not load YouTube. Changing the line would be a copy change.
