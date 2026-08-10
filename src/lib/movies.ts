import { api } from "@/lib/api"

export interface Movie {
  id: number
  title: string
  posterUrl: string
  genre: string
  language: string
  durationInMinutes: number
  rating?: string | number
  certification?: string
  description?: string
  releaseDate?: string
}

interface RawMovie {
  id?: number
  movieId?: number
  title?: string
  movie_name?: string
  name?: string
  movieName?: string
  movieTitle?: string
  posterUrl?: string
  poster?: string
  imageUrl?: string
  posterPath?: string
  genre?: string
  genres?: string | string[]
  language?: string
  lang?: string
  languages?: string | string[]
  durationInMinutes?: number
  duration?: number
  runtime?: number
  runtimeMinutes?: number
  rating?: string | number
  imdbRating?: string | number
  certification?: string
  certificate?: string
  description?: string
  synopsis?: string
  releaseDate?: string
}

function first<T>(...vals: (T | undefined | null)[]): T | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v
  }
  return undefined
}

function toText(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val.filter(Boolean).join(", ")
  return val
}

export function normalizeMovie(raw: RawMovie): Movie {
  return {
    id: (first(raw.id, raw.movieId) as number) ?? 0,
    title: first(raw.title, raw.name, raw.movieName, raw.movieTitle, raw.movie_name) ?? "Untitled",
    posterUrl: first(raw.posterUrl, raw.poster, raw.imageUrl, raw.posterPath) ?? "",
    genre: toText(first(raw.genre, raw.genres)) ?? "",
    language: toText(first(raw.language, raw.lang, raw.languages)) ?? "",
    durationInMinutes:
      (first(raw.durationInMinutes, raw.duration, raw.runtime, raw.runtimeMinutes) as number) ?? 0,
    rating: first(raw.rating, raw.imdbRating),
    certification: first(raw.certification, raw.certificate),
    description: first(raw.description, raw.synopsis),
    releaseDate: raw.releaseDate,
  }
}

// GET /api/movies?cityId={cityId}
export async function getMovies(cityId: number): Promise<Movie[]> {
  const raw = await api.get<RawMovie[]>(`/api/movies?cityId=${encodeURIComponent(cityId)}`)
  return Array.isArray(raw) ? raw.map(normalizeMovie) : []
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
