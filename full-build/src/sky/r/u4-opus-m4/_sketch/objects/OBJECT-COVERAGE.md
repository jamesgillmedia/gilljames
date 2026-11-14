# Objects: multi-angle coverage

Scope: `u4-opus-m4/_sketch/objects/` only. Survey of the m4 media (`media/nov9/objects/`, `media/pro2/img/photo/`, `media/pro2/img/objects/`, `media/studio/`, `media/pro2/joio/`) to decide which objects get a 3D (2.5D, angle-ordered) orbit layer. Objects without enough angles stay gallery-only.

Paths are relative to `u4-opus-m4/`. No private files are used or named here; every path below was checked to exist.

## How I grouped and scored

- I looked at every still in those folders as contact sheets and grouped them by object by eye. Where two files are the same frame (checked with a pixel signature, difference under 0.2 out of 255) they are listed once and the duplicate noted.
- The nov9 `manifest.json` labels ("joio.co cup", "unknown", "hand-carved piece") are rough, so they were not trusted for grouping.
- Viewpoint bands: **side** (camera at the object's level), **3/4** (about 30-45 degrees above), **top** (looking straight in), **close** (a detail or rim), **context** (the object among other things).
- Coverage score is 0-5: one point for each band that has at least one still of this same object in the repo. "Stills" is the count of distinct frames in the repo.
- Angle labels are visual estimates made by eye. They are not measured azimuths. For round pieces the elevation (side, 3/4, top) is the only angle that can really be told apart, so the orbit is ordered by elevation first.
- Drive-only: stills that the Drive index lists but that are NOT in the m4 repo. They can't be used until Gill's files are copied into the repo; they are named so they can be asked for.

## Summary

| Object | Stills in repo | Bands | Score | Decision |
|---|---|---|---|---|
| joio cup (cream, smoke-speckled glaze) | 14 | side, 3/4, top, close, context | 5 | chosen, orbit |
| ceramic oyster scoop | 4 | 3/4, front, side, context | 4 (Gill: no more exist, keep it flat) | chosen, orbit, 3 orbit layers + context card |
| dark-glazed cups and bowls (may be more than one object) | 8 | side, top, close | 3 | chosen, orbit, flagged thin |
| unfired raw clay cups | 5 (different cups mixed) | side, 3/4, top, close | 3 | chosen, orbit, flagged thin; Drive has 12 |
| ashy / sooty process bowls | 3 | 3/4, top | 2 | chosen, orbit, flagged thin; Drive has 7+ |
| moss planter (dark cup with moss) | 4 | side, 3/4, held, ledge | 3 (Gill: 3 angles) | gallery-only for now, lowest priority |
| brown-glazed small bowl | 1 | 3/4 | 1 (Drive has 3) | gallery-only for now, lowest priority |
| teal-rim cup | 2 (same frame twice) | close | 1 | gallery-only |
| wooden spoons and paddles | 20+ | many | n/a | gallery-only: several different pieces, not confirmed as one object, and Gill did not list them |
| design / wireframe / materials boards, carve, flower, teapot, heat | 1 each | n/a | 0 | gallery-only |

## 1. joio cup (chosen)

Cream glaze with dark smoke speckle and a wide mouth. Score 5/5.

| Path | View | Band |
|---|---|---|
| `media/pro2/img/photo/14af9fc6-960.webp` | held, from the side, low | side |
| `media/pro2/img/photo/f51e0021-960.webp` | on a speckled counter, latte (same frame as `media/pro2/img/objects/joio-latte-960.webp`) | side |
| `media/nov9/objects/IMG_6136.jpg` | on the counter, 3/4 with latte | side |
| `media/nov9/objects/IMG_9126.jpg` | latte, side, on a dark board | side |
| `media/nov9/objects/16B39E13-2667-41A0-BDF7-EC4D14309DE1.jpg` | latte, side, with other bowls | side |
| `media/pro2/img/photo/0d93c0c1-960.webp` | held, 3/4 from above (same frame as `media/pro2/img/objects/cup-glaze-960.webp` and `joio-hold-960.webp`) | 3/4 |
| `media/nov9/objects/IMG_5841.jpg` | held, 3/4 | 3/4 |
| `media/nov9/objects/IMG_5881.jpg` | held, 3/4 | 3/4 |
| `media/nov9/objects/IMG_0952.jpg` | on a table, 3/4 | 3/4 |
| `media/nov9/objects/IMG_6166.jpg` | held with latte | 3/4 |
| `media/pro2/img/photo/27a361ce-960.webp` | held, looking into the bowl | top |
| `media/pro2/img/photo/27a4c19d-960.webp` | held, latte from above (same frame as `media/pro2/img/objects/joio-960.webp` and `joio-pour-960.webp`) | top |
| `media/nov9/objects/IMG_5892.jpg` | held, looking in | top |
| `media/pro2/img/photo/e2aa7ba0-960.webp` | close on the speckled wall | close |
| `media/nov9/objects/IMG_1167.jpg`, `media/nov9/objects/IMG_6153.jpg`, `media/nov9/objects/IMG_6690.jpg` | on boards among other pieces | context |

Fix found while surveying: the 1f65e97 cup scene mixed in other objects: `cup-top-960` (the dark cup), `cup-moss-960` (the moss planter) and `cup-rim-960` (the teal-rim cup). They are removed from the cup's orbit.

## 2. ceramic oyster scoop (chosen, kept flat)

Cream almost oyster-shaped bowl, charred ridged handle. Per Gill the Drive search found nothing new: it is still 4 stills.

| Path | View | Band |
|---|---|---|
| `media/nov9/objects/0456C57F-49C0-4B5D-B7DE-D67B647AC163.jpg` | in hand, bowl up (same frame as `media/pro2/img/photo/e3407300-960.webp`) | 3/4 |
| `media/pro2/img/photo/388e4910-960.webp` | frontal, bowl and handle join | front |
| `media/pro2/img/photo/0f25314d-960.webp` | side profile of the bowl | side |
| `media/nov9/objects/64521049469__FE6EAC94-47E0-4BE1-B5CA-50AE12B31586.jpg` | lying on the paddles, for scale | context |

## 3. dark-glazed cups and bowls (chosen, thin)

May be more than one object (the rims differ a little); the sketch treats them as one ring and says so.

| Path | View | Band |
|---|---|---|
| `media/nov9/objects/DBBB3452-330C-4F73-8F21-65C1A57FE3AE.jpg` | black-and-white, side | side |
| `media/nov9/objects/F3283192-39BF-4BE9-B6F2-8A88933AB63A.jpg` | black-and-white, side, lighter | side |
| `media/pro2/img/photo/efb2a65e-960.webp` | on a shelf, side | side |
| `media/nov9/objects/IMG_9147.jpg` | dark cup, 3/4 low, yellow light | side |
| `media/nov9/objects/8F816FA1-7772-43DA-B2A8-B35EBE74B67C.jpg` | held, looking in | top |
| `media/pro2/img/photo/9b41ba33-960.webp` | black-and-white, looking in (same frame as `media/pro2/img/objects/cup-top-960.webp`) | top |
| `media/pro2/img/photo/1bb06b0e-960.webp` | looking in, in a sooty hand | top |
| `media/nov9/objects/2346BBC9-C359-4C43-9A58-DC2D47A870D5.jpg` | black-and-white close of a rim | close |

Drive-only (per the index): the Drive set adds `94F05E1B-D06B-4651-86C3-D5A3BD2783B8` (top, softer light) and `IMG_4075` (small black bowl on a shelf).

## 4. unfired raw clay cups (chosen, thin)

Different small cups and bowls mixed together, so the ring is thin and not one object. Drive has 12 stills.

| Path | View | Band |
|---|---|---|
| `media/nov9/objects/IMG_1322.jpg` | raw clay cup, exterior, in hand | side |
| `media/nov9/objects/IMG_1487.jpg` | pale cup in hand | 3/4 |
| `media/studio/cup-hand-480.webp` | white cup looking in (480px only) | top |
| `media/studio/unfired-480.webp` | textured white cup, close (480px only) | close |
| `media/nov9/objects/IMG_1279.jpg` | contact sheet of four small cups | context |

Drive-only: `IMG_1323`, `IMG_1488`, `IMG_1280`, `IMG_1281`, `IMG_1282`, `IMG_1283`, `24C29571-4AD8-4992-965D-54FBC5B8C665` (wet cup in hand), `46B6C5AE-8A38-4A6D-825E-0EA7531E1333`, `IMG_2264` (dark pot).

## 5. ashy / sooty process bowls (chosen, thin)

| Path | View | Band |
|---|---|---|
| `media/nov9/objects/IMG_4404.jpg` | wide bowl with a sooty interior, held | top |
| `media/nov9/objects/IMG_4670.jpg` | small ashy bowl, in a sooty hand | 3/4 |
| `media/nov9/objects/IMG_4356.jpg` | grey smoked cup interior, in hand | top |

All three are looking in from above, so the repo has no side view of an ashy bowl. Drive-only: `IMG_4415`, `IMG_4675`, `19FEFB2B-6350-4C4E-9252-F07DEA3723A5`, `A28A2B8B-C9C8-459F-AE81-DF9DE35790B3`, and burst frames `IMG_4405`, `IMG_4426`, `IMG_4427`, `IMG_4441`, `IMG_4444`, `IMG_4454`, `IMG_4660`, `IMG_4677`, `IMG_4679`, `IMG_4680`.

## Lowest priority: gallery-only for now

- **Moss planter** (dark cup, moss, pale inner rim). Four stills, Gill counts three angles: `media/pro2/img/photo/2316871b-960.webp` (held, 3/4), `media/pro2/img/photo/0fcf2a21-960.webp` (on a board, 3/4), `media/pro2/img/photo/8c86eb46-960.webp` (same cup, on a board; same frame as `media/pro2/img/objects/cup-moss-960.webp`), `media/nov9/objects/IMG_5414.jpg` (on a wood ledge). `media/pro2/img/photo/e1cf2ee5-960.webp` and `media/pro2/img/photo/6640a426-960.webp` are different, smaller planters.
- **Brown-glazed small bowl**: only `media/nov9/objects/IMG_5829.jpg` is in the repo. Drive also has `IMG_5831` and `IMG_5832`.

## What I need from Gill

To make the three thin rings real orbits, copy these Drive stills into the repo (nov9 objects folder): the unfired set, the ashy set and the two dark-glazed stills named above. The scoop stays at 4 stills.

## Wired from the approved package

The orbit and the gallery now use only `objects/rings/` (the approved package: joio-cup 11, dark-glazed 6, unfired-clay 6, ashy-bowls 9, scoop 4). Older `media/` paths are no longer shown. F3283192 is not in this set. The ashy ring is captioned as three process pieces (wide bowl, small grey cup, tan-rim bowl). No underside was added for the joio cup, the dark-glazed set or the scoop, and no context still was added for the joio cup or the dark-glazed set. Angle labels and the gaps are the ones in `objects/rings/MANIFEST.md`.
