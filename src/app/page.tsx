"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clapperboard, Loader2, Popcorn, Ticket } from "lucide-react"

import { OtpLoginForm } from "@/components/auth/otp-login-form"
import type { AuthUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  function handleSuccess(loggedIn: AuthUser) {
    setUser(loggedIn)
    router.push("/cities")
  }

  return (
    <main className="flex min-h-svh flex-col bg-background lg:flex-row">
      {/* Brand / marketing panel */}
      <section className="relative hidden overflow-hidden bg-card lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Cineverse</span>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground">
            Your seat to the story is one tap away.
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            Sign in with a secure one-time code, pick the perfect seats, and
            skip the line. No passwords to remember.
          </p>

          <ul className="mt-2 flex flex-col gap-4">
            {[
              { icon: Ticket, text: "Instant e-tickets with QR entry" },
              { icon: Popcorn, text: "Real-time seat availability" },
              { icon: CheckCircle2, text: "Passwordless, secure OTP login" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cineverse. All rights reserved.
        </p>
      </section>

      {/* Auth panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clapperboard className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Cineverse
            </span>
          </div>

          {user ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome, {user.name}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  You&apos;re signed in as {user.email}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {user.role === "ROLE_ADMIN" ? "Administrator" : "Member"}
              </span>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Taking you to city selection…
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enter your email to receive a one-time verification code.
                </p>
              </header>

              <OtpLoginForm onSuccess={handleSuccess} />

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                <p>
                  You can skip sign in for now and browse cities, movies, showtimes,
                  and seats.
                </p>
                <Link
                  href="/cities"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Skip and browse
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
