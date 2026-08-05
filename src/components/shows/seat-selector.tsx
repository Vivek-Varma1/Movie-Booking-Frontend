"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"

import { OtpLoginForm } from "@/components/auth/otp-login-form"
import { Button } from "@/components/ui/button"
import {
  getShowSeats,
  lockSeats,
  type Seat,
  type SeatCategory,
  type SeatRow,
  type ShowSeats,
} from "@/lib/shows"
import { createBooking, confirmBooking } from "@/lib/bookings"
import { ApiError } from "@/lib/api"
import { getCurrentUser, type AuthUser } from "@/lib/auth"

const CATEGORY_STYLES: Record<
  SeatCategory,
  { label: string; chip: string; swatch: string; selected: string; border: string }
> = {
  REGULAR: {
    label: "Regular",
    chip: "border border-border bg-surface-secondary text-white-soft",
    swatch: "bg-white-soft",
    selected: "bg-success text-white ring-success/30",
    border: "border-border",
  },
  PREMIUM: {
    label: "Premium",
    chip: "border border-info/30 bg-info/10 text-info",
    swatch: "bg-info",
    selected: "bg-success text-white ring-success/30",
    border: "border-info/60",
  },
  VIP: {
    label: "VIP",
    chip: "border border-brand-premium/40 bg-brand-premium/10 text-brand-premium",
    swatch: "bg-brand-premium",
    selected: "bg-success text-white ring-success/30",
    border: "border-brand-premium/70",
  },
  RECLINER: {
    label: "Recliner",
    chip: "border border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary",
    swatch: "bg-brand-secondary",
    selected: "bg-success text-white ring-success/30",
    border: "border-brand-secondary/70",
  },
}

function seatBg(seat: Seat, isSelected: boolean) {
  if (seat.status === "BOOKED")
    return "border border-border bg-surface-secondary text-muted-foreground cursor-not-allowed opacity-45"
  if (seat.status === "LOCKED")
    return "border border-error/70 bg-error text-white cursor-not-allowed opacity-80"
  if (isSelected)
    return "border border-success bg-success text-white ring-2 ring-success/30 ring-offset-1 ring-offset-background cursor-pointer"
  return "border border-border bg-surface-secondary text-white-soft transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-secondary hover:bg-surface-hover hover:shadow-[0_0_0_1px_rgba(247,181,56,0.18)] cursor-pointer"
}

type BookingStep = "select" | "locking" | "confirming" | "done" | "error"

interface SeatGroup {
  category: SeatCategory
  rows: SeatRow[]
  priceRange: { min: number; max: number }
}

export function SeatSelector({ showId, cityId }: { showId: number; cityId: number }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [step, setStep] = useState<BookingStep>("select")
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [failedStep, setFailedStep] = useState<string>("")
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [resumeBookingAfterLogin, setResumeBookingAfterLogin] = useState(false)
  const [signedInUser, setSignedInUser] = useState<AuthUser | null>(null)

  const { data, error, isLoading, mutate } = useSWR<ShowSeats>(
    [`show-seats`, showId],
    () => getShowSeats(showId),
    { revalidateOnFocus: false },
  )
  const { data: currentUser } = useSWR<AuthUser>("me", getCurrentUser, {
    revalidateOnFocus: false,
    errorRetryCount: 0,
    shouldRetryOnError: false,
  })

  // Group rows by category for clear visual separation.
  const groups = useMemo<SeatGroup[]>(() => {
    if (!data) return []
    const result: SeatGroup[] = []
    for (const row of data.rows) {
      // Use the most common category in the row as the row's category.
      const counts = new Map<SeatCategory, number>()
      for (const s of row.seats) counts.set(s.seatCategory, (counts.get(s.seatCategory) ?? 0) + 1)
      let rowCategory: SeatCategory = "REGULAR"
      let max = 0
      counts.forEach((c, cat) => {
        if (c > max) {
          max = c
          rowCategory = cat
        }
      })

      const prices = row.seats.map((s) => s.price)
      const min = Math.min(...prices)
      const maxP = Math.max(...prices)

      const lastGroup = result[result.length - 1]
      if (lastGroup && lastGroup.category === rowCategory) {
        lastGroup.rows.push(row)
        lastGroup.priceRange.min = Math.min(lastGroup.priceRange.min, min)
        lastGroup.priceRange.max = Math.max(lastGroup.priceRange.max, maxP)
      } else {
        result.push({ category: rowCategory, rows: [row], priceRange: { min, max: maxP } })
      }
    }
    return result
  }, [data])

  function toggleSeat(seat: Seat) {
    if (seat.status !== "AVAILABLE" || step !== "select") return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(seat.showSeatId)) {
        next.delete(seat.showSeatId)
      } else {
        next.add(seat.showSeatId)
      }
      return next
    })
  }

  const selectedSeats = data
    ? data.rows.flatMap((r) => r.seats).filter((s) => selected.has(s.showSeatId))
    : []

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  async function handleBooking(overrideUser?: AuthUser) {
    if (selected.size === 0) return

    const activeUser = overrideUser ?? signedInUser ?? currentUser
    if (!activeUser) {
      setAuthPromptOpen(true)
      setResumeBookingAfterLogin(true)
      return
    }

    setAuthPromptOpen(false)
    setResumeBookingAfterLogin(false)
    setBookingError(null)
    setFailedStep("")

    try {
      setStep("locking")
      setFailedStep("locking seats")
      await lockSeats(showId, Array.from(selected))

      setStep("confirming")
      setFailedStep("creating booking")
      const booking = await createBooking(showId, Array.from(selected))
      const bId = booking.bookingId
      setBookingId(bId)

      setFailedStep("confirming payment")
      await confirmBooking(bId)

      setStep("done")
    } catch (err) {
      setStep("error")
      if (err instanceof ApiError) {
        let message = err.message
        if (err.status === 403 || err.status === 401) {
          message =
            "You don't have permission to book. Please sign in again and try."
        } else if (err.status === 409) {
          message =
            "One or more seats were just booked by someone else. Please pick different seats."
        } else if (err.status === 400) {
          message = "Invalid booking request. Please refresh and try again."
        }
        setBookingError(`${message} (status ${err.status})`)
      } else if (err instanceof Error) {
        setBookingError(err.message || "Something went wrong. Please try again.")
      } else {
        setBookingError("Something went wrong. Please try again.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-secondary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-primary p-10 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error instanceof ApiError ? error.message : "Failed to load seat layout."}
        </p>
        <Button onClick={() => mutate()} variant="secondary">
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (!data) return null

  // Done state
  if (step === "done") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-surface-primary p-8 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-success text-white shadow-[0_0_0_4px_rgba(2,70,46,0.18)]">
          <Check className="size-8" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your tickets for <span className="font-medium text-foreground">{data.movieName}</span>{" "}
            at <span className="font-medium text-foreground">{data.theatreName}</span> have been
            booked.
          </p>
        </div>
        <div className="w-full rounded-lg border border-border bg-surface-secondary/70 px-4 py-3 text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Seats</p>
          <p className="font-semibold text-foreground">
            {selectedSeats.map((s) => s.seatLabel).join(", ")}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-brand-premium">₹{totalPrice.toFixed(2)}</p>
        </div>
        {bookingId && (
          <p className="text-xs text-muted-foreground">
            Booking ID: <span className="font-mono font-medium">{bookingId}</span>
          </p>
        )}
        <Button onClick={() => router.push(`/movies?cityId=${cityId}`)} className="w-full">
          Back to Movies
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{data.movieName}</h1>
        <p className="text-sm text-muted-foreground">
          {data.theatreName} · {data.screenName} · {data.showSlot} · {data.showDate}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface-primary p-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded border border-border bg-surface-secondary" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded bg-success" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded bg-error" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded bg-brand-premium" />
          Locked
        </span>
      </div>

      {/* Seat groups */}
      <div className="flex flex-col gap-8">
        {groups.map((group, idx) => {
          const style = CATEGORY_STYLES[group.category]
          return (
            <div key={`${group.category}-${idx}`} className="flex flex-col gap-3">
              {/* Category heading */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style.chip}`}
                  >
                    <span className={`size-2 rounded-full ${style.swatch}`} />
                    {style.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.rows.length} row{group.rows.length > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {group.priceRange.min === group.priceRange.max
                    ? `₹${group.priceRange.min.toFixed(0)}`
                    : `₹${group.priceRange.min.toFixed(0)} – ₹${group.priceRange.max.toFixed(0)}`}
                </span>
              </div>

              {/* Rows in this category — Row A at top, last row at bottom */}
              <div className="overflow-x-auto">
                <div className="mx-auto w-fit space-y-1.5 px-4">
                  {group.rows.map((row) => (
                    <div key={row.row} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
                        {row.row}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {row.seats.map((seat) => {
                          const isSelected = selected.has(seat.showSeatId)
                          return (
                            <button
                              key={seat.showSeatId}
                              type="button"
                              onClick={() => toggleSeat(seat)}
                              disabled={seat.status !== "AVAILABLE" || step !== "select"}
                              title={`${seat.seatLabel} — ${CATEGORY_STYLES[seat.seatCategory]?.label ?? seat.seatCategory} — ₹${seat.price}${seat.status !== "AVAILABLE" ? ` (${seat.status})` : ""}`}
                              className={`flex size-8 items-center justify-center rounded-md text-[10px] font-medium ${seatBg(seat, isSelected)}`}
                            >
                              {seat.seatNumber}
                            </button>
                          )
                        })}
                      </div>
                      <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
                        {row.row}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Curved screen at the bottom (near the last row) */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <svg
          viewBox="0 0 400 50"
          className="h-10 w-full max-w-xl"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Curved screen: arc from top-left, down in the middle, back up to top-right */}
          <path
            d="M 10 10 Q 200 48 390 10 L 390 14 Q 200 52 10 14 Z"
            fill="url(#screenGrad)"
            className="text-white-soft"
          />
          <path
            d="M 10 10 Q 200 48 390 10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-white-soft"
          />
        </svg>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Screen this way
        </p>
      </div>

      {/* Booking bar */}
      {selected.size > 0 && step === "select" && !authPromptOpen && (
        <div className="sticky bottom-4 z-40 mx-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-border bg-surface-primary/95 p-4 shadow-2xl backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {selected.size} seat{selected.size > 1 ? "s" : ""} ·{" "}
              {selectedSeats.map((s) => s.seatLabel).join(", ")}
            </p>
            <p className="text-lg font-bold text-foreground">₹{totalPrice.toFixed(2)}</p>
          </div>
          <Button onClick={() => void handleBooking()} className="h-11 px-6">
            Book Now
          </Button>
        </div>
      )}

      {selected.size > 0 && step === "select" && authPromptOpen && (
        <div className="sticky bottom-4 z-40 mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface-primary/95 p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Sign in to confirm booking</p>
            <p className="text-sm text-muted-foreground">
              Your seats are still selected. You can sign in now or skip and continue browsing.
            </p>
          </div>

          <OtpLoginForm
            onSuccess={(loggedIn) => {
              setSignedInUser(loggedIn)
              if (resumeBookingAfterLogin) {
                void handleBooking(loggedIn)
              } else {
                setAuthPromptOpen(false)
              }
            }}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAuthPromptOpen(false)
                setResumeBookingAfterLogin(false)
              }}
            >
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {/* Processing states */}
      {(step === "locking" || step === "confirming") && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-primary p-8 text-center">
          <Loader2 className="size-8 animate-spin text-brand-secondary" />
          <p className="font-medium text-foreground">
            {step === "locking" ? "Locking your seats…" : "Confirming your booking…"}
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait, this will only take a moment.
          </p>
        </div>
      )}

      {/* Error state with detailed diagnostics */}
      {step === "error" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-error/30 bg-error/5 p-8 text-center">
          <ShieldAlert className="size-10 text-error" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-foreground">Booking failed</p>
            <p className="text-sm text-muted-foreground">
              {bookingError}
            </p>
            {failedStep && (
              <p className="text-xs text-muted-foreground">
                Failed while <span className="font-medium text-foreground">{failedStep}</span>
              </p>
            )}
          </div>
          {bookingError?.includes("status 403") || bookingError?.includes("status 401") ? (
            <div className="w-full max-w-sm rounded-lg border border-border bg-surface-primary p-3 text-left">
              <p className="text-xs font-medium text-foreground">What to try:</p>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>• Sign out and sign back in to refresh your session</li>
                <li>• Make sure your backend allows cross-origin cookies (SameSite=None, Secure)</li>
                <li>• Check that the backend&apos;s CORS allows your frontend origin</li>
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setStep("select")
                setBookingError(null)
                setFailedStep("")
                mutate()
              }}
            >
              <RefreshCw className="size-4" />
              Refresh & Retry
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
