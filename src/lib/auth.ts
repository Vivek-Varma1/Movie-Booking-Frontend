import { api } from "@/lib/api"

export type UserRole = "ROLE_USER" | "ROLE_ADMIN"

export interface AuthUser {
  id: number
  name: string
  email: string
  phoneNumber: string
  role: UserRole
}

interface SendOtpResponse {
  message: string
}

interface VerifyOtpResponse {
  token: string
  user: AuthUser
}

// POST /api/auth/send-otp  (Public)
export function sendOtp(email: string) {
  return api.post<SendOtpResponse>("/api/auth/send-otp", { email })
}

// POST /api/auth/verify-otp (Public)
export function verifyOtp(email: string, otp: string) {
  return api.post<VerifyOtpResponse>("/api/auth/verify-otp", { email, otp })
}

// GET /api/auth/me (Authenticated)
export function getCurrentUser() {
  return api.get<AuthUser>("/api/auth/me")
}

// POST /api/auth/logout (Authenticated)
export function logout() {
  return api.post<{ message: string }>("/api/auth/logout")
}

// PUT /api/users/profile (Authenticated)
export function updateProfile(data: { name: string; phoneNumber: string }) {
  return api.put<AuthUser>("/api/users/profile", data)
}
