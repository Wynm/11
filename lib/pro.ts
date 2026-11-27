"use client";

/**
 * Fatoura Pro licensing — offline-first.
 *
 * A licence is a short signed token: base64url(payload) + "." + base64url(signature).
 * The payload is verified with an Ed25519 public key baked into the bundle, so the
 * browser can validate a key without phoning home (and without shipping any secret).
 * Issuing happens server-side only (see /api/license and scripts/mint-license.mjs).
 */

export const PRO_PUBLIC_KEY = "MCowBQYDK2VwAyEA+gNgdxxujQQWUZfogpC4G7VsFJDTmMU+cznMfnmMV9I=";

export const PRO_PRICE = { monthly: 49, yearly: 399 } as const;

export type ProState = {
  active: boolean;
  plan: "monthly" | "yearly" | "lifetime" | null;
  expiresAt: number | null;
  email: string | null;
  key: string | null;
};

const K = "fatoura.pro.v1";
const DAY = 86_400_000;

export const INACTIVE: ProState = {
  active: false,
  plan: null,
  expiresAt: null,
  email: null,
  key: null,
};

const b64urlToBytes = (s: string): Uint8Array<ArrayBuffer> => {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const bytesToB64url = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export type LicensePayload = {
  /** subject — buyer email, lower-cased */
  sub: string;
  plan: "monthly" | "yearly" | "lifetime";
  /** issued-at (unix seconds) */
  iat: number;
  /** expires-at (unix seconds); 0 = lifetime */
  exp: number;
  /** short order reference for support */
  ref?: string;
};

const normalise = (key: string) => key.replace(/\s+/g, "").replace(/–|—/g, "-");

/** Verify locally with WebCrypto when available, otherwise fall back to the server. */
export async function verifyLicense(raw: string): Promise<LicensePayload | null> {
  const token = normalise(raw);
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  let payload: LicensePayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as LicensePayload;
  } catch {
    return null;
  }
  if (!payload?.sub || !payload.plan) return null;

  const data = new TextEncoder().encode(body);
  const signature = b64urlToBytes(sig);

  try {
    if (globalThis.crypto?.subtle) {
      const key = await crypto.subtle.importKey("spki", b64urlToBytes(PRO_PUBLIC_KEY), { name: "Ed25519" }, false, [
        "verify",
      ]);
      const ok = await crypto.subtle.verify({ name: "Ed25519" }, key, signature, data);
      if (!ok) return null;
      return payload;
    }
  } catch {
    /* older browser without Ed25519 — verify on the server instead */
  }

  try {
    const res = await fetch("/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    return (await res.json()) as LicensePayload;
  } catch {
    return null;
  }
}

export const readPro = (): ProState => {
  if (typeof window === "undefined") return INACTIVE;
  try {
    const raw = window.localStorage.getItem(K);
    if (!raw) return INACTIVE;
    const s = JSON.parse(raw) as ProState;
    if (!s?.key) return INACTIVE;
    const expired = !!s.expiresAt && s.expiresAt < Date.now();
    return { ...s, active: !expired };
  } catch {
    return INACTIVE;
  }
};

const announce = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("fatoura:pro"));
};

export async function activateLicense(raw: string): Promise<{ ok: true; state: ProState } | { ok: false; message: string }> {
  const payload = await verifyLicense(raw);
  if (!payload) return { ok: false, message: "المفتاح غير صالح. تأكد من نسخه كاملًا كما وصل إليك." };

  const expiresAt = payload.exp ? payload.exp * 1000 : null;
  if (expiresAt && expiresAt < Date.now()) return { ok: false, message: "هذا المفتاح انتهت صلاحيته — جدّده من صفحة الاشتراك." };

  const state: ProState = { active: true, plan: payload.plan, expiresAt, email: payload.sub, key: normalise(raw) };
  try {
    window.localStorage.setItem(K, JSON.stringify(state));
  } catch {
    return { ok: false, message: "تعذّر الحفظ في المتصفح — تأكد أن التخزين المحلي مسموح." };
  }
  announce();
  return { ok: true, state };
}

export const signOutPro = () => {
  try {
    window.localStorage.removeItem(K);
  } catch {
    /* ignore */
  }
  announce();
};

export const proDaysLeft = (s: ProState) => (s.expiresAt ? Math.max(0, Math.ceil((s.expiresAt - Date.now()) / DAY)) : null);

/** Total ceiling of the free plan: how many documents before the nudge appears. */
export const FREE_LIMIT = 5;

export const priceLabel = (plan: "monthly" | "yearly") =>
  plan === "monthly" ? `${PRO_PRICE.monthly} د.م/شهر` : `${PRO_PRICE.yearly} د.م/سنة`;

export { bytesToB64url };
