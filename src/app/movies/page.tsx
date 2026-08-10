"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { getSelectedCity } from "@/lib/cities"
import { MoviesCatalog } from "@/components/movies/movies-catalog"
import { Navbar } from "@/components/layout/navbar"

function MoviesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [resolved, setResolved] = useState<{ cityId: number; cityName: string } | null>(null)

  useEffect(() => {
    const queryCityId = searchParams.get("cityId")
    const saved = getSelectedCity()

    const cityId = queryCityId ? Number(queryCityId) : saved?.cityId ?? null
    if (!cityId || Number.isNaN(cityId)) {
      router.replace("/cities")
      return
    }
    const cityName = saved && saved.cityId === cityId ? saved.name : ""
    setResolved({ cityId, cityName })
  }, [searchParams, router])

  return resolved ? (
    <MoviesCatalog cityId={resolved.cityId} cityName={resolved.cityName} />
  ) : (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function MoviesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          }
        >
          <MoviesPageContent />
        </Suspense>
      </main>
    </>
  )
}
