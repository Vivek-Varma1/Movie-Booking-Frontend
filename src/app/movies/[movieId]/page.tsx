"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { DatePicker } from "@/components/shows/date-picker"
import { TheatreShowsList } from "@/components/shows/theatre-shows"
import { getShowDates, getShowsForDate, type ShowsForDate } from "@/lib/shows"
import { getSelectedCity } from "@/lib/cities"
import { Button } from "@/components/ui/button"

function MovieShowsContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const movieId = Number(params.movieId)
  const queryCityId = searchParams.get("cityId")
  const saved = getSelectedCity()
  const cityId = queryCityId ? Number(queryCityId) : saved?.cityId ?? 0

  const [selectedDate, setSelectedDate] = useState<string>("")

  // Fetch available show dates
  const {
    data: dates,
    error: datesError,
    isLoading: datesLoading,
  } = useSWR(
    cityId ? [`show-dates`, movieId, cityId] : null,
    () => getShowDates(movieId, cityId),
    { revalidateOnFocus: false },
  )

  // Auto-select first date
  useEffect(() => {
    if (dates && dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0])
    }
  }, [dates, selectedDate])

  // Fetch shows for selected date
  const {
    data: showsData,
    error: showsError,
    isLoading: showsLoading,
    mutate: mutateShows,
  } = useSWR<ShowsForDate>(
    selectedDate && cityId ? [`shows`, movieId, cityId, selectedDate] : null,
    () => getShowsForDate(movieId, cityId, selectedDate),
    { revalidateOnFocus: false },
  )

  if (!cityId) {
    router.replace("/cities")
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push(`/movies?cityId=${cityId}`)}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to movies
      </button>

      {datesLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-brand-secondary" />
        </div>
      ) : datesError ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-primary p-10 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load show dates.</p>
        </div>
      ) : dates && dates.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-primary p-10 text-center">
          <p className="font-medium text-foreground">No shows available</p>
          <p className="text-sm text-muted-foreground">
            This movie doesn&apos;t have any scheduled shows in your city right now.
          </p>
          <Button variant="secondary" onClick={() => router.push(`/movies?cityId=${cityId}`)}>
            Browse other movies
          </Button>
        </div>
      ) : dates ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {showsData?.movieTitle ?? "Select a date"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a date to see available showtimes
            </p>
          </div>

          <DatePicker dates={dates} selected={selectedDate} onSelect={setSelectedDate} />

          {showsLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-brand-secondary" />
            </div>
          ) : showsError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-primary p-8 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <p className="text-sm text-muted-foreground">Failed to load shows.</p>
              <Button variant="secondary" size="sm" onClick={() => mutateShows()}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          ) : showsData ? (
            <TheatreShowsList theatres={showsData.theatres} cityId={cityId} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default function MovieShowsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-brand-secondary" />
            </div>
          }
        >
          <MovieShowsContent />
        </Suspense>
      </main>
    </>
  )
}
