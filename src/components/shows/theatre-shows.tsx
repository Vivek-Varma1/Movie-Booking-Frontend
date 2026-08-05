"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"

import type { TheatreShows as TheatreShowsType } from "@/lib/shows"

function formatTime(isoStr: string) {
  const d = new Date(isoStr)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function slotColor(slot: string) {
  switch (slot) {
    case "MORNING":
      return "text-brand-secondary"
    case "AFTERNOON":
      return "text-info"
    case "EVENING":
      return "text-white-soft"
    case "NIGHT":
      return "text-brand-premium"
    default:
      return "text-muted-foreground"
  }
}

export function TheatreShowsList({
  theatres,
  cityId,
}: {
  theatres: TheatreShowsType[]
  cityId: number
}) {
  if (theatres.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-primary px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No shows available for this date.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {theatres.map((theatre) => (
        <div
          key={theatre.theatreId}
          className="rounded-xl border border-border bg-surface-primary p-4 sm:p-5"
        >
          <div className="mb-3 flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">
              {theatre.theatreName}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {theatre.address}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {theatre.shows.map((show) => (
              <Link
                key={show.showId}
                href={`/shows/${show.showId}/seats?cityId=${cityId}`}
                className="group flex flex-col items-center gap-1 rounded-lg border border-border px-4 py-2.5 transition-all hover:border-brand-secondary hover:bg-surface-hover/70"
              >
                <span className="text-sm font-semibold text-brand-secondary group-hover:text-brand-premium">
                  {formatTime(show.startTime)}
                </span>
                <span className={`text-[10px] font-medium uppercase ${slotColor(show.showSlot)}`}>
                  {show.showSlot}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {show.screenName} · ₹{show.minimumPrice}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
