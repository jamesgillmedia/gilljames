---
name: artist-catalog
description: Look up James Gill / Gill James credits and image sets from the local catalog tools before answering.
---

# Artist catalog

1. For bio / who / poem → `get_artist_profile`.
2. For a title, client, reel, commercial, or music video → `search_works`
   with the tightest filter that still matches.
3. For stills or Joio → `list_image_sets`.
4. Quote tool results. Do not invent missing fields.
5. If `total` is 0, widen the query once, then say nothing matched.
