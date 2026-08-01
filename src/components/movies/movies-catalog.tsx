"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { AlertCircle, MapPin, RefreshCw, Search } from "lucide-react"

import { getMovies, type Movie } from "@/lib/movies"
import { ApiError } from "@/lib/api"
import { MovieCard } from "@/components/movies/movie-card"

export function MoviesCatalog({
  cityId,
  cityName,
}: {
  cityId: number
  cityName: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [genre, setGenre] = useState<string>("All")

  const { data, error, isLoading, mutate, isValidating } = useSWR<Movie[]>(
    ["movies", cityId],
    () => getMovies(cityId),
    { revalidateOnFocus: false },
  )

  const genres = useMemo(() => {
    const set = new Set<string>()
    for (const m of data ?? []) if (m.genre) set.add(m.genre)
    return ["All", ...Array.from(set).sort()]
  }, [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? []).filter((m) => {
      const matchesQuery = !q || m.title.toLowerCase().includes(q)
      const matchesGenre = genre === "All" || m.genre === genre
      return matchesQuery && matchesGenre
    })
  }, [data, query, genre])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/cities")}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          {cityName || `City #${cityId}`}
          <span className="text-primary">Change</span>
        </button>
        <div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Now showing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a movie to see showtimes near you.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            aria-label="Search movies"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                genre === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <MovieGridSkeleton />
      ) : error ? (
        <ErrorState
          message={
            error instanceof ApiError
              ? error.status === 401 || error.status === 403
                ? "The movie catalog is unavailable right now."
                : error.message
              : "Failed to load movies."
          }
          onRetry={() => mutate()}
          retrying={isValidating}
        />
      ) : filtered.length === 0 ? (
        <EmptyState hasMovies={(data ?? []).length > 0} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} cityId={cityId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="animate-pulse bg-secondary" style={{ aspectRatio: "2 / 3" }} />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string
  onRetry: () => void
  retrying: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-card-foreground">Couldn&apos;t load movies</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <RefreshCw className={`size-4 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
        Try again
      </button>
    </div>
  )
}

function EmptyState({ hasMovies }: { hasMovies: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <p className="font-medium text-card-foreground">
        {hasMovies ? "No movies match your filters" : "No movies playing here yet"}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasMovies
          ? "Try clearing your search or choosing a different genre."
          : "Check back soon or pick another city."}
      </p>
    </div>
  )
}
