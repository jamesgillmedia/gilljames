import { prompt } from "@cursor/bdk";
import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { loadCatalog } from "../lib/catalog";

export default defineTool({
  description: prompt`
    Summarize still-image sets on the Gill James site: general photos
    and the Joio set. Use when asked about photography, stills, or Joio.
  `,
  effect: "read",
  inputSchema: z.object({
    set: z
      .enum(["photos", "joio", "both"])
      .default("both")
      .describe("Which image set to summarize"),
    sample: z
      .number()
      .int()
      .min(0)
      .max(12)
      .optional()
      .describe("How many sample asset ids to include (default 4)"),
  }),
  async execute({ set, sample }) {
    const catalog = loadCatalog();
    const n = sample ?? 4;
    const summarize = (items: typeof catalog.photos) => {
      const kinds: Record<string, number> = {};
      for (const item of items) {
        kinds[item.kind] = (kinds[item.kind] ?? 0) + 1;
      }
      return {
        count: items.length,
        kinds,
        samples: items.slice(0, n).map((item) => ({
          id: item.id,
          kind: item.kind,
          src: item.src,
        })),
      };
    };

    return {
      artist: catalog.artist,
      site: catalog.site,
      photos: set === "joio" ? undefined : summarize(catalog.photos),
      joio: set === "photos" ? undefined : summarize(catalog.joio),
    };
  },
});
