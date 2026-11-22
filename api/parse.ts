import { getModels, parseDonorText } from "../src/lib/intake.js";

const MAX_TEXT_LENGTH = 2000;

function json(status: number, payload: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { ok: false, reason: "method_not_allowed" }, { Allow: "POST" });
  }

  const body: unknown = await request.json().catch(() => null);
  const text =
    typeof body === "object" && body !== null ? (body as { text?: unknown }).text : undefined;

  if (typeof text !== "string" || text.trim() === "" || text.length > MAX_TEXT_LENGTH) {
    return json(400, { ok: false, reason: "bad_request" });
  }

  // The key is read only on the server and is never included in any response.
  const result = await parseDonorText(text, {
    apiKey: process.env.GROQ_API_KEY,
    models: getModels(process.env),
  });

  // Failures return only the reason; upstream detail (status, message, model) stays server-side.
  if (result.ok) return json(200, result);
  if (result.reason === "rate_limited") return json(429, { ok: false, reason: "rate_limited" });
  if (result.reason === "no_key") return json(500, { ok: false, reason: "no_key" });
  return json(502, { ok: false, reason: result.reason });
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
