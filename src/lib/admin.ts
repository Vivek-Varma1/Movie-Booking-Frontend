import { api } from "./api"

export interface CreateCityResp {
  id: number
  name: string
}

// POST /api/cities (ROLE_ADMIN)
export function createCity(name: string) {
  return api.post<CreateCityResp>("/api/cities", { name })
}

// POST /api/cities/bulk (ROLE_ADMIN)
export function bulkCreateCities(cities: string[]) {
  return api.post<CreateCityResp[]>("/api/cities/bulk", { cities })
}

// Theatre helpers
export interface Theatre {
  id: number
  name: string
  address: string
  city: { id: number; name: string }
}

export function createTheatre(payload: { name: string; address: string; cityId: number }) {
  return api.post<Theatre>("/api/theatres", payload)
}

export function getTheatre(theatreId: number) {
  return api.get<Theatre>(`/api/theatres/${theatreId}`)
}

// list theatres (optionally by city)
export function listTheatres(cityId?: number) {
  return api.get<Theatre[]>(`/api/theatres${cityId ? `?cityId=${cityId}` : ""}`)
}

// Screens
export interface CreateScreenPayload {
  name: string
  lastRow: string
  seatsPerRow: number
  seatRules: Array<{ fromRow: string; toRow: string; seatCategory: string }>
}

export function createScreen(theatreId: number, payload: CreateScreenPayload) {
  return api.post<{ id: number; name: string; totalSeats: number; theatreId: number; lastRow: string; seatsPerRow: number }>(
    `/api/theatres/${theatreId}/screens`,
    payload,
  )
}

export function deleteScreen(theatreId: number, screenId: number) {
  // use apiExt.delete (imported dynamically to avoid circular)
  // import here to avoid top-level circular dependency issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiExt } = require("./api")
  return apiExt.delete(`/api/theatres/${theatreId}/screens/${screenId}`)
}

export function listScreensForTheatre(theatreId: number) {
  return api.get<any[]>(`/api/theatres/${theatreId}/screens`)
}

// Movies (multipart for poster upload)
export interface MovieRequest {
  movieName: string
  durationInMinutes: number
  language: string
  genres: string[]
  certificate: string
  movieStatus: string
  releaseDate: string
  trailerUrl?: string
  synopsis?: string
}

// note: uses apiExt.postForm
export async function createMovie(request: MovieRequest, poster?: File) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiExt } = require("./api")
  const form = new FormData()
  form.append("request", JSON.stringify(request))
  if (poster) form.append("poster", poster)
  return apiExt.postForm(`/api/movies`, form)
}

export async function updateMovie(movieId: number, request: Partial<MovieRequest>, poster?: File) {
  const { apiExt } = require("./api")
  const form = new FormData()
  form.append("request", JSON.stringify(request))
  if (poster) form.append("poster", poster)
  return apiExt.postForm(`/api/movies/${movieId}`, form)
}

export function deleteMovie(movieId: number) {
  const { apiExt } = require("./api")
  return apiExt.delete(`/api/movies/${movieId}`)
}

export function listMovies() {
  return api.get<any[]>(`/api/movies`)
}

export function searchMovies(q: string) {
  return api.get<any[]>(`/api/movies/search?query=${encodeURIComponent(q)}`)
}

// Shows
export function createShow(payload: { movieId: number; screenId: number; showDate: string; showSlot: string }) {
  return api.post(`/api/shows`, payload)
}

export function deleteShow(showId: number) {
  const { apiExt } = require("./api")
  return apiExt.delete(`/api/shows/${showId}`)
}

// Users
export interface UserProfile {
  id: number
  name: string
  email: string
  role: string
}

export function listUsers() {
  return api.get<UserProfile[]>(`/api/users`)
}

export function getUser(userId: number) {
  return api.get<UserProfile>(`/api/users/${userId}`)
}

export default {}
