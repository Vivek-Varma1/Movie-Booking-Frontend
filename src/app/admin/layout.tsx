export const metadata = {
  title: "Admin — Cineverse",
}

// Server layout left intentionally minimal: the Admin page uses a client-side guard
// (`getCurrentUser` + SWR) to verify the signed-in user's role. Removing the
// server-side redirect prevents forcing a login prompt when the client already
// has a valid session cookie that the server couldn't verify during SSR.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
