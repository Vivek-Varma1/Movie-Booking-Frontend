import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cineverse — Movie Booking",
  description: "Book movie tickets with secure, passwordless OTP login.",
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111111" }],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-surface-background">
      <body className="antialiased">{children}</body>
    </html>
  )
}
