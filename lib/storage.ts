"use client";

import type { Invoice, Issuer } from "./invoice";
import { EMPTY_ISSUER, newInvoice } from "./invoice";

const K = {
  invoices: "fatoura.invoices.v1",
  issuer: "fatoura.issuer.v1",
  flags: "fatoura.flags.v1",
};

export type ShareRef = { token: string; url: string; expiresAt: string; at: number };
export type Flags = {
  claimed: { at: number; kind: Invoice["kind"]; number: string } | null;
  tourDone: boolean;
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the editor keeps working in memory */
  }
};

export const store = {
  list(): Invoice[] {
    const rows = read<Invoice[]>(K.invoices, []);
    return Array.isArray(rows) ? rows : [];
  },

  save(inv: Invoice) {
    const rows = store.list();
    const i = rows.findIndex((r) => r.number === inv.number && r.createdAt === inv.createdAt);
    if (i >= 0) rows[i] = inv;
    else rows.unshift(inv);
    write(K.invoices, rows);
  },

  replace(rows: Invoice[]) {
    write(K.invoices, rows);
  },

  get(createdAt: number): Invoice | null {
    return store.list().find((r) => r.createdAt === createdAt) ?? null;
  },

  remove(createdAt: number) {
    write(K.invoices, store.list().filter((r) => r.createdAt !== createdAt));
  },

  issuer(): Issuer {
    return read<Issuer>(K.issuer, EMPTY_ISSUER);
  },

  setIssuer(issuer: Issuer) {
    write(K.issuer, issuer);
  },

  flags(): Flags {
    return read<Flags>(K.flags, { claimed: null, tourDone: false });
  },

  setFlags(f: Flags) {
    write(K.flags, f);
  },

  claim(kind: Invoice["kind"], number: string) {
    const f = store.flags();
    if (f.claimed) return f.claimed;
    const next: Flags = { ...f, claimed: { at: Date.now(), kind, number } };
    write(K.flags, next);
    return next.claimed!;
  },

  fresh(kind: Invoice["kind"]): Invoice {
    const issuer = store.issuer();
    const inv = newInvoice(kind, store.list(), issuer);
    store.save(inv);
    return inv;
  },
};
