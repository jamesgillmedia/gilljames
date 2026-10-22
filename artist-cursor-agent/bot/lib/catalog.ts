import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type FilmWork = {
  n: number;
  title: string;
  client: string | null;
  cat: string;
  platform: string;
  url: string;
  duration: string | null;
};

export type ImageVariant = {
  jpg: string;
  webp: string;
  w: number;
  h: number;
};

export type PhotoItem = {
  id: string;
  kind: string;
  src: {
    t: ImageVariant;
    l: ImageVariant;
  };
};

export type Catalog = {
  artist: string;
  site: string;
  poem: string;
  bio: string;
  film_categories: Record<string, number>;
  films: FilmWork[];
  photo_count: number;
  photos: PhotoItem[];
  joio_count: number;
  joio: PhotoItem[];
  source: string;
};

const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "catalog.json");

let cached: Catalog | undefined;

export function loadCatalog(): Catalog {
  if (!cached) {
    cached = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  }
  return cached;
}

function haystack(film: FilmWork): string {
  return [film.title, film.client ?? "", film.cat, film.platform, film.url]
    .join(" ")
    .toLowerCase();
}

export function searchFilms(options: {
  query?: string;
  category?: string;
  client?: string;
  limit?: number;
}): { total: number; matches: FilmWork[] } {
  const catalog = loadCatalog();
  const q = options.query?.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();
  const client = options.client?.trim().toLowerCase();
  const limit = Math.min(Math.max(options.limit ?? 8, 1), 36);

  const matches = catalog.films.filter((film) => {
    if (category && film.cat.toLowerCase() !== category) return false;
    if (client && !(film.client ?? "").toLowerCase().includes(client)) return false;
    if (q && !haystack(film).includes(q)) return false;
    return true;
  });

  return { total: matches.length, matches: matches.slice(0, limit) };
}
