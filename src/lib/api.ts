// Central API client for the Movie Booking System frontend.
// Security model: Cookie-Based Authentication (JWT in an HttpOnly cookie named ACCESS_TOKEN).

const DEFAULT_API_BASE_URL = "https://movie-booking-service-rabbitmq.onrender.com"

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "")

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

type Json = Record<string, unknown> | unknown[]

async function request<T>(
  path: string,
  options: RequestInit & { json?: Json } = {},
): Promise<T> {
  const { json, headers, ...rest } = options

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    ...rest,
  })

  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : null) ?? `Request failed with status ${res.status}`
    throw new ApiError(message, res.status, payload)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: Json, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", json }),
  put: <T>(path: string, json?: Json, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PUT", json }),
}
