"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCities, setSelectedCity, type City } from "@/lib/cities"

export function CitySelector() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pendingId, setPendingId] = useState<number | null>(null)

  const { data, error, isLoading, mutate, isValidating } = useSWR<City[]>(
    "/api/cities",
    getCities,
    { revalidateOnFocus: false },
  )

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((c) => c.name.toLowerCase().includes(q))
  }, [data, query])

  function handleSelect(city: City) {
    setPendingId(city.cityId)
    setSelectedCity(city)
    router.push(`/movies?cityId=${city.cityId}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your city…"
          aria-label="Search cities"
          className="h-12 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Couldn&apos;t load cities
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
              {error instanceof Error
                ? error.message
                : "Something went wrong while contacting the server."}
            </p>
          </div>
          <Button onClick={() => mutate()} variant="secondary">
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Building2 className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            {query ? `No cities match "${query}".` : "No cities are available yet."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((city) => {
            const isPending = pendingId === city.cityId
            return (
              <li key={city.cityId}>
                <button
                  type="button"
                  onClick={() => handleSelect(city)}
                  disabled={pendingId !== null}
                  className="group flex h-28 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary hover:bg-primary/5 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {isPending ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <MapPin className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{city.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {isValidating && !isLoading && (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Refreshing…
        </p>
      )}
    </div>
  )
}
