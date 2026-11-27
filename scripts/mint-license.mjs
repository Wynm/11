#!/usr/bin/env node
/**
 * Mint a Fatoura Pro licence key.
 *
 *   node scripts/mint-license.mjs someone@example.com monthly 30
 *   node scripts/mint-license.mjs someone@example.com yearly 365 --ref=CM-12345
 *   node scripts/mint-license.mjs someone@example.com lifetime 0
 *
 * The private key lives only in the seller's environment (never in the repo):
 *   FATOURA_LICENSE_SECRET=<base64 pkcs8 ed25519 key>
 */
import { createPrivateKey, sign } from "node:crypto";

const [, , sub, plan = "yearly", days = "365"] = process.argv;
const ref = (process.argv.find((a) => a.startsWith("--ref=")) || "").slice(6);

if (!sub || !["monthly", "yearly", "lifetime"].includes(plan)) {
  console.error("usage: mint-license.mjs <email> <monthly|yearly|lifetime> <days> [--ref=ORDER]");
  process.exit(1);
}

const secret = process.env.FATOURA_LICENSE_SECRET;
if (!secret) {
  console.error("FATOURA_LICENSE_SECRET is not set (base64 PKCS8 Ed25519 private key).");
  process.exit(1);
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const iat = Math.floor(Date.now() / 1000);
const ttl = Number(days) || 0;
const payload = {
  sub: sub.trim().toLowerCase(),
  plan,
  iat,
  exp: ttl > 0 ? iat + ttl * 86_400 : 0,
  ...(ref ? { ref } : {}),
};

const body = b64url(JSON.stringify(payload));
const key = createPrivateKey({ key: Buffer.from(secret, "base64"), format: "der", type: "pkcs8" });
const sig = b64url(sign(null, Buffer.from(body, "utf8"), key));

console.log(`${body}.${sig}`);
console.error(`✓ ${payload.sub} · ${plan} · ${ttl ? new Date(payload.exp * 1000).toISOString().slice(0, 10) : "lifetime"}`);
