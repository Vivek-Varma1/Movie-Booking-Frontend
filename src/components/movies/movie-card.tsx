"use client"

import Link from "next/link"
import { Clock, Languages, Star } from "lucide-react"

import { formatDuration, type Movie } from "@/lib/movies"

export function MovieCard({ movie, cityId }: { movie: Movie; cityId: number }) {
  return (
    <Link
      href={`/movies/${movie.id}?cityId=${cityId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative overflow-hidden bg-secondary" style={{ aspectRatio: "2 / 3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.posterUrl || "/placeholder.svg?height=450&width=300&query=movie%20poster"}
          alt={`Poster for ${movie.title}`}
          crossOrigin="anonymous"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=450&width=300"
          }}
        />
        {movie.genre && (
          <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur">
            {movie.genre}
          </span>
        )}
        {movie.rating && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur">
            <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
            {movie.rating}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-pretty font-semibold leading-tight text-card-foreground group-hover:text-primary">
            {movie.title}
          </h3>
          {movie.certification && (
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
              {movie.certification}
            </span>
          )}
        </div>

        {movie.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{movie.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {movie.language && (
            <span className="inline-flex items-center gap-1">
              <Languages className="size-3.5" aria-hidden="true" />
              {movie.language}
            </span>
          )}
          {movie.durationInMinutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatDuration(movie.durationInMinutes)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
