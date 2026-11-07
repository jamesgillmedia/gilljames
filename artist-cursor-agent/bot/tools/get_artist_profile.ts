import { prompt } from "@cursor/bdk";
import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { loadCatalog } from "../lib/catalog";

export default defineTool({
  description: prompt`
    Return James Gill (Gill James) artist profile: bio, poem, site URL,
    and catalog counts by film category. Use for who-is / about / bio asks.
  `,
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    const catalog = loadCatalog();
    return {
      artist: catalog.artist,
      site: catalog.site,
      bio: catalog.bio,
      poem: catalog.poem,
      filmCategories: catalog.film_categories,
      filmCount: catalog.films.length,
      photoCount: catalog.photo_count,
      joioCount: catalog.joio_count,
      source: catalog.source,
    };
  },
});
