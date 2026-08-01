"use client"

import { useState } from "react"
import useSWR from "swr"
import { AlertCircle, Loader2, Save, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser, updateProfile, type AuthUser } from "@/lib/auth"
import { ApiError } from "@/lib/api"

export function ProfileForm() {
  const { data: user, error, isLoading, mutate } = useSWR<AuthUser>(
    "me",
    getCurrentUser,
    { revalidateOnFocus: false },
  )

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Seed form with current user data once loaded.
  if (user && !initialized) {
    setName(user.name ?? "")
    setPhone(user.phoneNumber ?? "")
    setInitialized(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setSaveError(null)
    try {
      const updated = await updateProfile({
        name: name.trim(),
        phoneNumber: phone.trim(),
      })
      mutate(updated, false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to update profile.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error instanceof ApiError
            ? error.message
            : "Unable to load profile. Please sign in."}
        </p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex flex-col items-center gap-4">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary">
          <User className="size-10" />
        </span>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {user.role === "ROLE_ADMIN" ? "Administrator" : "Member"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {saveError && (
          <p className="text-sm text-destructive">{saveError}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-600">Profile updated successfully!</p>
        )}

        <Button type="submit" disabled={saving} className="h-11">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
