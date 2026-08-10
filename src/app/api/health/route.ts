import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

const HEALTH_URL = `${API_BASE_URL}/actuator/health`;

export async function GET() {
  try {
    const response = await fetch(HEALTH_URL, { cache: "no-store" });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      return Response.json(
        { ok: false, backendStatus: response.status },
        { status: 502 },
      );
    }

    return Response.json(payload ?? { ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
