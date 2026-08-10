"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { getCities, type City } from "@/lib/cities"
import {
  createCity,
  bulkCreateCities,
  createTheatre,
  getTheatre,
  createScreen,
  deleteScreen,
  createMovie,
  updateMovie,
  deleteMovie,
  createShow,
  listUsers,
} from "@/lib/admin"
import { listTheatres, listScreensForTheatre, listMovies } from "@/lib/admin"
import AsyncSelect from "@/components/admin/async-select"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: user } = useSWR("me", getCurrentUser, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  useEffect(() => {
    if (user === undefined) return
    if (!user) {
      alert("Access denied: admin only")
      router.push("/")
      return
    }

    // Broadened admin detection to match backend shapes like 'ADMIN', arrays, or flags
    const roleVal: any = (user as any).role ?? (user as any).roleName ?? null
    const rolesArr: any = (user as any).roles ?? (user as any).authorities ?? null
    const isAdmin =
      (typeof roleVal === "string" && (roleVal === "ROLE_ADMIN" || roleVal === "ADMIN" || roleVal.toUpperCase().includes("ADMIN"))) ||
      (Array.isArray(rolesArr) && rolesArr.some((r: any) => String(r).toUpperCase().includes("ADMIN"))) ||
      (user as any).isAdmin === true

    if (!isAdmin) {
      alert("Access denied: admin only")
      router.push("/")
    }
  }, [user, router])

  const { data: cities, mutate: mutateCities, isLoading: citiesLoading } = useSWR<City[]>("cities", getCities, {
    revalidateOnFocus: false,
  })

  // small tabbed dashboard state
  const [tab, setTab] = useState<"cities" | "theatres" | "screens" | "movies" | "shows" | "users">("cities")

  // city form
  const [name, setName] = useState("")
  const [bulkText, setBulkText] = useState("")
  const [loading, setLoading] = useState(false)

  // theatre form
  const [theatreName, setTheatreName] = useState("")
  const [theatreAddress, setTheatreAddress] = useState("")
  const [theatreCityId, setTheatreCityId] = useState<number | null>(null)

  // screen form
  const [screenTheatreId, setScreenTheatreId] = useState<number | null>(null)
  const [screenName, setScreenName] = useState("")
  const [lastRow, setLastRow] = useState("J")
  const [seatsPerRow, setSeatsPerRow] = useState(12)
  const [seatRulesText, setSeatRulesText] = useState("A-D:REGULAR,E-H:PREMIUM,I-J:VIP")

  // theatres/movie lists for dropdowns
  const { data: theatres } = useSWR("admin-theatres", () => listTheatres())
  const { data: movies } = useSWR("admin-movies", () => listMovies())

  // screens for selected theatre (shows tab)
  const [showTheatreId, setShowTheatreId] = useState<number | null>(null)
  const { data: screensForShow } = useSWR(showTheatreId ? ["admin-screens", showTheatreId] : null, () => listScreensForTheatre(showTheatreId as number))
  const [showMovieId, setShowMovieId] = useState<number | null>(null)
  const [showScreenId, setShowScreenId] = useState<number | null>(null)

  // movie form
  const [movieJson, setMovieJson] = useState("")
  const [posterFile, setPosterFile] = useState<File | undefined>(undefined)

  const { data: users } = useSWR("admin-users", listUsers)

  async function handleAddCity(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createCity(name.trim())
      setName("")
      await mutateCities()
    } catch (err) {
      console.error(err)
      alert("Failed to create city")
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkCreate(e: React.FormEvent) {
    e.preventDefault()
    const lines = bulkText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (lines.length === 0) return
    setLoading(true)
    try {
      await bulkCreateCities(lines)
      setBulkText("")
      await mutateCities()
    } catch (err) {
      console.error(err)
      alert("Bulk create failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTheatre(e: React.FormEvent) {
    e.preventDefault()
    if (!theatreName || !theatreAddress || !theatreCityId) return alert("fill all theatre fields")
    setLoading(true)
    try {
      await createTheatre({ name: theatreName, address: theatreAddress, cityId: theatreCityId })
      setTheatreName("")
      setTheatreAddress("")
      setTheatreCityId(null)
      await mutateCities()
      alert("Theatre created")
    } catch (err) {
      console.error(err)
      alert("Failed to create theatre")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateScreen(e: React.FormEvent) {
    e.preventDefault()
    if (!screenTheatreId) return alert("Select theatre id")
    try {
      const rules = seatRulesText.split(",").map((p) => {
        const [range, cat] = p.split(":" )
        const [from, to] = range.split("-")
        return { fromRow: from, toRow: to, seatCategory: cat }
      })
      await createScreen(screenTheatreId, { name: screenName, lastRow, seatsPerRow, seatRules: rules })
      alert("Screen created")
    } catch (err) {
      console.error(err)
      alert("Create screen failed")
    }
  }

  async function handleCreateMovie(e: React.FormEvent) {
    e.preventDefault()
    try {
      const req = JSON.parse(movieJson)
      await createMovie(req, posterFile)
      setMovieJson("")
      setPosterFile(undefined)
      alert("Movie created")
    } catch (err) {
      console.error(err)
      alert("Create movie failed (check JSON)")
    }
  }

  async function handleCreateShow(e: React.FormEvent) {
    e.preventDefault()
    if (!showMovieId || !showScreenId) return alert("Select movie and screen")
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form).entries()) as any
    try {
      await createShow({ movieId: showMovieId, screenId: showScreenId, showDate: data.showDate, showSlot: data.showSlot })
      alert("Show scheduled")
    } catch (err) {
      console.error(err)
      alert("Create show failed")
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage cities, theatres, screens, movies, shows and users.</p>

      <div className="mt-6 flex gap-2">
        <Button onClick={() => setTab("cities")} variant={tab === "cities" ? "default" : "outline"}>Cities</Button>
        <Button onClick={() => setTab("theatres")} variant={tab === "theatres" ? "default" : "outline"}>Theatres</Button>
        <Button onClick={() => setTab("screens")} variant={tab === "screens" ? "default" : "outline"}>Screens</Button>
        <Button onClick={() => setTab("movies")} variant={tab === "movies" ? "default" : "outline"}>Movies</Button>
        <Button onClick={() => setTab("shows")} variant={tab === "shows" ? "default" : "outline"}>Shows</Button>
        <Button onClick={() => setTab("users")} variant={tab === "users" ? "default" : "outline"}>Users</Button>
      </div>

      <div className="mt-6">
        {tab === "cities" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">City Management</h2>
            <form onSubmit={handleAddCity} className="mt-4 flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="City name" className="flex-1 rounded-md border border-border bg-transparent px-3 py-2" />
              <Button type="submit" disabled={loading}>Add</Button>
            </form>
            <form onSubmit={handleBulkCreate} className="mt-4">
              <label className="text-sm">Bulk create (one city per line)</label>
              <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-transparent p-3" rows={6} />
              <div className="mt-2"><Button type="submit">Create Cities</Button></div>
            </form>
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Existing Cities</h3>
              <div className="mt-2">
                {citiesLoading && <div>Loading...</div>}
                {cities && (<ul className="grid grid-cols-2 gap-2">{cities.map((c) => (<li key={c.cityId} className="rounded-md border border-border px-3 py-2">{c.name}</li>))}</ul>)}
              </div>
            </div>
          </section>
        )}

        {tab === "theatres" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">Theatre Management</h2>
            <form onSubmit={handleCreateTheatre} className="mt-4 grid grid-cols-3 gap-2">
              <input value={theatreName} onChange={(e) => setTheatreName(e.target.value)} placeholder="Theatre name" className="col-span-1 rounded-md border border-border px-3 py-2" />
              <input value={theatreAddress} onChange={(e) => setTheatreAddress(e.target.value)} placeholder="Address" className="col-span-1 rounded-md border border-border px-3 py-2" />
              <select value={theatreCityId ?? ""} onChange={(e) => setTheatreCityId(Number(e.target.value) || null)} className="col-span-1 rounded-md border border-border px-3 py-2">
                <option value="">Select city</option>
                {cities?.map((c) => (<option key={c.cityId} value={c.cityId}>{c.name}</option>))}
              </select>
              <div className="col-span-3 mt-2"><Button type="submit">Create Theatre</Button></div>
            </form>
          </section>
        )}

        {tab === "screens" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">Screen Configurator</h2>
                    <form onSubmit={handleCreateScreen} className="mt-4 grid grid-cols-2 gap-2">
                      <AsyncSelect
                        fetcher={async (q) => {
                          const all = await listTheatres()
                          return (all || []).filter((t: any) => String(t.name).toLowerCase().includes(q.toLowerCase())).map((t: any) => ({ label: `${t.name} — ${t.city?.name ?? ''}`, value: t.id, ...t }))
                        }}
                        value={screenTheatreId ? { label: theatres?.find((x: any) => x.id === screenTheatreId)?.name ?? String(screenTheatreId), value: screenTheatreId } as any : null}
                        onChange={(v: any) => setScreenTheatreId(v ? Number(v.value) : null)}
                        placeholder="Search theatre..."
                      />
              <input value={screenName} onChange={(e) => setScreenName(e.target.value)} placeholder="Screen name" className="rounded-md border border-border px-3 py-2" />
              <input value={lastRow} onChange={(e) => setLastRow(e.target.value)} placeholder="Last row (e.g. J)" className="rounded-md border border-border px-3 py-2" />
              <input type="number" value={seatsPerRow} onChange={(e) => setSeatsPerRow(Number(e.target.value))} className="rounded-md border border-border px-3 py-2" />
              <input value={seatRulesText} onChange={(e) => setSeatRulesText(e.target.value)} placeholder="A-D:REGULAR,E-H:PREMIUM" className="col-span-2 rounded-md border border-border px-3 py-2" />
              <div className="col-span-2 mt-2"><Button type="submit">Create Screen</Button></div>
            </form>
          </section>
        )}

        {tab === "movies" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">Movie Management</h2>
            <form onSubmit={handleCreateMovie} className="mt-4">
              <label className="text-sm">Movie JSON (metadata)</label>
              <textarea value={movieJson} onChange={(e) => setMovieJson(e.target.value)} className="mt-2 w-full rounded-md border border-border p-3" rows={8} />
              <div className="mt-2">
                <label className="text-sm">Poster</label>
                <input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0])} className="mt-1" />
              </div>
              <div className="mt-3"><Button type="submit">Create Movie</Button></div>
            </form>
          </section>
        )}

        {tab === "shows" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">Show Scheduling</h2>
            <form onSubmit={handleCreateShow} className="mt-4 grid grid-cols-3 gap-2">
              <AsyncSelect
                fetcher={async (q) => {
                  const all = await listMovies()
                  return (all || []).filter((m: any) => (m.movieName || m.title || m.movieTitle || "").toLowerCase().includes(q.toLowerCase())).map((m: any) => ({ label: m.movieName ?? m.title ?? m.movieTitle ?? m.name, value: m.id ?? m.movieId, ...m }))
                }}
                onChange={(v: any) => setShowMovieId(v ? Number(v.value) : null)}
                placeholder="Search movie..."
              />

              <AsyncSelect
                fetcher={async (q) => {
                  const all = await listTheatres()
                  return (all || []).filter((t: any) => String(t.name).toLowerCase().includes(q.toLowerCase())).map((t: any) => ({ label: t.name, value: t.id, ...t }))
                }}
                value={showTheatreId ? { label: theatres?.find((x: any) => x.id === showTheatreId)?.name ?? String(showTheatreId), value: showTheatreId } as any : null}
                onChange={(v: any) => setShowTheatreId(v ? Number(v.value) : null)}
                placeholder="Search theatre..."
              />

              <AsyncSelect
                fetcher={async (q) => {
                  if (!showTheatreId) return []
                  const all = await listScreensForTheatre(showTheatreId)
                  return (all || []).filter((s: any) => String(s.name).toLowerCase().includes(q.toLowerCase())).map((s: any) => ({ label: s.name, value: s.id ?? s.screenId, ...s }))
                }}
                onChange={(v: any) => setShowScreenId(v ? Number(v.value) : null)}
                placeholder="Select screen..."
              />
              <input name="showDate" placeholder="YYYY-MM-DD" className="rounded-md border border-border px-3 py-2" />
              <select name="showSlot" className="rounded-md border border-border px-3 py-2">
                <option value="MORNING">MORNING</option>
                <option value="MATINEE">MATINEE</option>
                <option value="AFTERNOON">AFTERNOON</option>
                <option value="EVENING">EVENING</option>
                <option value="NIGHT">NIGHT</option>
              </select>
              <div className="col-span-3 mt-2"><Button type="submit">Schedule Show</Button></div>
            </form>
          </section>
        )}

        {tab === "users" && (
          <section className="rounded-lg border border-border bg-surface-primary p-4">
            <h2 className="text-lg font-semibold">User Management</h2>
            <div className="mt-4">
              {users ? (
                <ul className="grid grid-cols-2 gap-2">
                  {users.map((u: any) => (
                    <li key={u.id} className="rounded-md border border-border px-3 py-2">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="text-xs text-muted-foreground">{u.role}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>Loading users…</div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
