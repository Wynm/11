import { NextResponse } from "next/server";
import { createPublicKey, verify as verifySignature } from "node:crypto";

const PUBLIC_KEY = "MCowBQYDK2VwAyEA+gNgdxxujQQWUZfogpC4G7VsFJDTmMU+cznMfnmMV9I=";

const unb64url = (s: string) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export async function POST(request: Request) {
  let token = "";
  try {
    token = String(((await request.json()) as { token?: string }).token ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const [body, sig] = token.split(".");
  if (!body || !sig) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const key = createPublicKey({ key: Buffer.from(PUBLIC_KEY, "base64"), format: "der", type: "spki" });
    const ok = verifySignature(null, Buffer.from(body, "utf8"), key, unb64url(sig));
    if (!ok) return NextResponse.json({ error: "invalid" }, { status: 400 });
    return NextResponse.json(JSON.parse(unb64url(body).toString("utf8")));
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
