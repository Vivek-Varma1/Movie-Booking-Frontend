import { api, API_BASE_URL } from "@/lib/api"

export interface Booking {
  bookingId: number
  showId: number
  movieName?: string
  theatreName?: string
  screenName?: string
  showDate?: string
  showSlot?: string
  seats?: string[]
  totalPrice?: number
  status?: string
}

// POST /api/bookings
export function createBooking(showId: number, showSeatIds: number[]) {
  return api.post<Booking>("/api/bookings", { showId, showSeatIds })
}

// POST /api/bookings/{bookingId}/confirm
export function confirmBooking(bookingId: number) {
  return api.post<Booking>(`/api/bookings/${bookingId}/confirm`)
}

// GET /api/bookings/{ticketId}/qr — returns image/png
export function getQrUrl(ticketId: number) {
  return `${API_BASE_URL}/api/bookings/${ticketId}/qr`
}
