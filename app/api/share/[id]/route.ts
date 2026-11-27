import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{8,40}$/.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "cloud_not_configured" }, { status: 503 });
  }

  const res = await fetch(
    `${url}/rest/v1/invoices?id=eq.${encodeURIComponent(id)}&select=doc,created_at,expires_at`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 502 });
  }

  const rows = (await res.json()) as { doc: unknown; created_at: string; expires_at: string | null }[];
  const row = rows[0];
  if (!row || (row.expires_at && new Date(row.expires_at).getTime() < Date.now())) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { doc: row.doc, createdAt: row.created_at },
    { headers: { "Cache-Control": "no-store" } },
  );
}
