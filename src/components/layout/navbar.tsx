"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Clapperboard, LogOut, User, Menu, X, Loader2 } from "lucide-react"

import { getCurrentUser, logout, type AuthUser } from "@/lib/auth"
import { getSelectedCity } from "@/lib/cities"

export function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Fetch the current user so the navbar reflects auth state on every page.
  const { data: user, mutate } = useSWR<AuthUser>("me", getCurrentUser, {
    revalidateOnFocus: false,
    errorRetryCount: 0,
    shouldRetryOnError: false,
  })

  // Debug: log the fetched user so we can verify the shape at runtime
  useEffect(() => {
    if (user !== undefined) {
      // eslint-disable-next-line no-console
      console.debug("Navbar: current user:", user)
    }
  }, [user])

  const profileRef = useRef<HTMLDivElement | null>(null)

  function isAdmin(u?: AuthUser | null) {
    if (!u) return false
    // common role shapes: role string, uppercase variants, roles array, boolean flag
    const roleVal: any = (u as any).role ?? (u as any).roleName ?? null
    const rolesArr: any = (u as any).roles ?? (u as any).authorities ?? null
    if (typeof roleVal === "string" && (roleVal === "ROLE_ADMIN" || roleVal === "ADMIN" || roleVal.toUpperCase() === "ROLE_ADMIN" || roleVal.toUpperCase() === "ADMIN")) return true
    if (Array.isArray(rolesArr) && rolesArr.some((r: any) => String(r).toUpperCase().includes("ADMIN"))) return true
    if ((u as any).isAdmin === true) return true
    return false
  }

  // Development helper: allow forcing admin link by adding ?asAdmin=1 to the URL
  let forceAdmin = false
  if (typeof window !== "undefined") {
    try {
      const url = new URL(window.location.href)
      forceAdmin = url.searchParams.get("asAdmin") === "1"
    } catch (e) {
      forceAdmin = false
    }
  }

  // close the profile menu on outside click or Escape key
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileMenuOpen) return
      const el = profileRef.current
      if (el && e.target && !el.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileMenuOpen(false)
    }

    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [profileMenuOpen])

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

  function handleBrandClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const selected = getSelectedCity()
    const cityId = selected?.cityId ?? 1
    router.push(`/movies?cityId=${cityId}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/movies?cityId=1" onClick={handleBrandClick} className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-secondary text-surface-background">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Cineverse
          </span>
          {forceAdmin && (
            <Link href="/admin/dashboard" className="ml-4 rounded-md bg-surface-hover px-2 py-1 text-sm text-muted-foreground">Admin</Link>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          {forceAdmin && !user && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-secondary px-3 py-1.5 text-sm font-medium text-surface-background transition-opacity hover:bg-brand-premium"
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand-secondary/15 text-brand-secondary">
                    <User className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="max-w-[140px] truncate font-medium text-foreground">
                    {user.name || user.email}
                  </span>
                </button>

                {profileMenuOpen && (
                  <div ref={profileRef} role="menu" aria-label="Profile menu" className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-surface-primary shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block w-full px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover"
                    >
                      Profile
                    </Link>
                    {(isAdmin(user) || forceAdmin) && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block w-full px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { setProfileMenuOpen(false); handleLogout() }}
                      disabled={loggingOut}
                      className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover disabled:opacity-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
              {(isAdmin(user) || forceAdmin) && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  <User className="size-4" />
                  Admin Dashboard
                </Link>
              )}
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
            <div className="flex items-center gap-2">
              {forceAdmin && (
                <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="mr-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover">Admin Dashboard</Link>
              )}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-surface-background"
              >
                Sign in
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
