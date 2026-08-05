"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import { Clapperboard, LogOut, User, Menu, X, Loader2 } from "lucide-react"

import { getCurrentUser, logout, type AuthUser } from "@/lib/auth"

export function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Fetch the current user so the navbar reflects auth state on every page.
  const { data: user, mutate } = useSWR<AuthUser>("me", getCurrentUser, {
    revalidateOnFocus: false,
    errorRetryCount: 0,
    shouldRetryOnError: false,
  })

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // ignore
    }
    // Clear the cached user so the navbar updates immediately.
    mutate(undefined, false)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/cities" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-secondary text-surface-background">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Cineverse
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-secondary/15 text-brand-secondary">
                  <User className="size-3.5" aria-hidden="true" />
                </span>
                <span className="max-w-[140px] truncate font-medium text-foreground">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-surface-background transition-opacity hover:bg-brand-premium"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-2 border-t border-border bg-surface-background px-4 py-3 sm:hidden">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-secondary/15 text-brand-secondary">
                  <User className="size-4" />
                </span>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.name || "Your profile"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <User className="size-4" />
                Edit profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout() }}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
              >
                {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-surface-background"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
