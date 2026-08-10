"use client"

import Link from "next/link"
import { Clock, Languages, Star } from "lucide-react"

import { formatDuration, type Movie } from "@/lib/movies"

export function MovieCard({ movie, cityId }: { movie: Movie; cityId: number }) {
  return (
    <Link
      href={`/movies/${movie.id}?cityId=${cityId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-primary shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow,transform] duration-220 ease-out hover:-translate-y-0.5 hover:border-brand-secondary hover:shadow-[0_10px_28px_rgba(0,0,0,0.4),0_0_12px_rgba(247,181,56,0.18)] focus-visible:[outline:2px_solid_var(--color-info)] focus-visible:outline-offset-2"
    >
      <div className="relative overflow-hidden bg-surface-secondary" style={{ aspectRatio: "2 / 3" }}>
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
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        {movie.genre && (
          <span className="absolute left-2 top-2 rounded-md bg-surface-background/80 px-2 py-1 text-xs font-medium text-white-soft backdrop-blur">
            {movie.genre}
          </span>
        )}
        {movie.rating && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-brand-premium px-2 py-1 text-xs font-semibold text-surface-background shadow-sm backdrop-blur">
            <Star className="size-3.5 fill-surface-background text-surface-background" aria-hidden="true" />
            {movie.rating}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-pretty font-semibold leading-tight text-card-foreground group-hover:text-brand-secondary">
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
