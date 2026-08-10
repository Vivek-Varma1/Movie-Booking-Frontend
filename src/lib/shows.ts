import { api } from "@/lib/api"

// GET /api/movies/{movieId}/show-dates?cityId={cityId}
export function getShowDates(movieId: number, cityId: number) {
  return api.get<string[]>(`/api/movies/${movieId}/show-dates?cityId=${cityId}`)
}

export interface ShowSlot {
  showId: number
  startTime: string
  screenName: string
  showSlot: string
  minimumPrice: number
}

export interface TheatreShows {
  theatreId: number
  theatreName: string
  address: string
  shows: ShowSlot[]
}

export interface ShowsForDate {
  movieId: number
  movieTitle: string
  date: string
  theatres: TheatreShows[]
}

// GET /api/movies/{movieId}/shows?cityId={cityId}&showDate={date}
export function getShowsForDate(movieId: number, cityId: number, showDate: string) {
  return api.get<ShowsForDate>(
    `/api/movies/${movieId}/shows?cityId=${cityId}&showDate=${showDate}`,
  )
}

export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED"
export type SeatCategory = "REGULAR" | "PREMIUM" | "VIP" | "RECLINER"

export interface Seat {
  showSeatId: number
  seatId: number
  seatNumber: number
  seatLabel: string
  seatCategory: SeatCategory
  price: number
  status: SeatStatus
}

export interface SeatRow {
  row: string
  seats: Seat[]
}

export interface ShowSeats {
  showId: number
  movieName: string
  showDate: string
  showSlot: string
  theatreName: string
  screenName: string
  rows: SeatRow[]
}

// GET /api/shows/{showId}/seats
export function getShowSeats(showId: number) {
  return api.get<ShowSeats>(`/api/shows/${showId}/seats`)
}

export interface LockResponse {
  lockedSeatIds: number[]
  lockedUntil: string
}

// POST /api/shows/lock
export function lockSeats(showId: number, showSeatIds: number[]) {
  return api.post<LockResponse>("/api/shows/lock", { showId, showSeatIds })
}
