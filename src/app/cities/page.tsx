import { Clapperboard } from "lucide-react"
import Link from "next/link"

import { CitySelector } from "@/components/cities/city-selector"

export default function CitiesPage() {
  return (
    <main className="min-h-svh bg-surface-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-5 py-4 sm:px-8">
          <Link href="/cities" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-secondary text-surface-background">
              <Clapperboard className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Cineverse
            </span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Where are you watching?
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Choose your city to see the movies, showtimes, and theatres near you.
          </p>
        </div>

        <CitySelector />
      </section>
    </main>
  )
}
