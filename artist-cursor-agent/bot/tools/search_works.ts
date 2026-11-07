import { prompt } from "@cursor/bdk";
import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { loadCatalog, searchFilms } from "../lib/catalog";

export default defineTool({
  description: prompt`
    Search Gill James film, commercial, music-video, and reel credits.
    Filter by free-text query, category (reel|commercial|music|film), or client.
    Prefer this over guessing titles, clients, or links from memory.
  `,
  effect: "read",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Substring match across title, client, category, platform, url"),
    category: z
      .enum(["reel", "commercial", "music", "film"])
      .optional()
      .describe("Exact film category"),
    client: z.string().optional().describe("Substring match on client name"),
    limit: z.number().int().min(1).max(36).optional().describe("Max results (default 8)"),
  }),
  async execute(input) {
    const catalog = loadCatalog();
    const { total, matches } = searchFilms(input);
    return {
      artist: catalog.artist,
      categories: catalog.film_categories,
      total,
      returned: matches.length,
      works: matches,
    };
  },
});
