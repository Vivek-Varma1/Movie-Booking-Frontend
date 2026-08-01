"use client"

import { Navbar } from "@/components/layout/navbar"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <ProfileForm />
      </main>
    </>
  )
}
