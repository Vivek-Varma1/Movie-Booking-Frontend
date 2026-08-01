"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { SeatSelector } from "@/components/shows/seat-selector"
import { getSelectedCity } from "@/lib/cities"

function SeatsContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const showId = Number(params.showId)
  const queryCityId = searchParams.get("cityId")
  const saved = getSelectedCity()
  const cityId = queryCityId ? Number(queryCityId) : saved?.cityId ?? 0

  return <SeatSelector showId={showId} cityId={cityId} />
}

export default function SeatsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          }
        >
          <SeatsContent />
        </Suspense>
      </main>
    </>
  )
}
