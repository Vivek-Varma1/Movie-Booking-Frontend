import { api } from "@/lib/api"

export interface City {
  cityId: number
  name: string
}

// GET /api/cities (Public)
export function getCities() {
  return api.get<City[]>("/api/cities")
}

const SELECTED_CITY_COOKIE = "selectedCityId"
const SELECTED_CITY_NAME_COOKIE = "selectedCityName"

export function setSelectedCity(city: City) {
  if (typeof document === "undefined") return
  const maxAge = 60 * 60 * 24 * 30
  document.cookie = `${SELECTED_CITY_COOKIE}=${city.cityId}; path=/; max-age=${maxAge}; samesite=lax`
  document.cookie = `${SELECTED_CITY_NAME_COOKIE}=${encodeURIComponent(
    city.name,
  )}; path=/; max-age=${maxAge}; samesite=lax`
}

export function getSelectedCity(): { cityId: number; name: string } | null {
  if (typeof document === "undefined") return null
  const entries = Object.fromEntries(
    document.cookie.split("; ").map((c) => {
      const [k, ...v] = c.split("=")
      return [k, v.join("=")]
    }),
  )
  const id = entries[SELECTED_CITY_COOKIE]
  const name = entries[SELECTED_CITY_NAME_COOKIE]
  if (!id) return null
  return { cityId: Number(id), name: name ? decodeURIComponent(name) : "" }
}
