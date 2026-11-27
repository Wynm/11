export type InvoiceItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type Client = {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  ice: string;
};

export type Issuer = {
  name: string;
  activity: string;
  ice: string;
  if: string;
  rc: string;
  cnss: string;
  email: string;
  phone: string;
  address: string;
  bankName: string;
  rib: string;
};

export type Branding = {
  /** accent colour used for the document frame and totals */
  accent: string;
  /** "١" hides the "made with Fatoura" footer line (Pro) */
  hideFooter: boolean;
  /** optional logo shipped as a data URL (max ~200 KB) */
  logo: string;
};

export const DEFAULT_BRANDING: Branding = { accent: "#0B5D50", hideFooter: false, logo: "" };

export type Invoice = {
  v: 1;
  /** "invoice" = facture, "quote" = devis */
  kind: "invoice" | "quote";
  number: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: "draft" | "sent" | "paid";
  currency: "MAD";
  language: "ar" | "fr";
  issuer: Issuer;
  client: Client;
  items: InvoiceItem[];
  /** true = HT (prices exclude tax), false = TTC (prices include tax) — client must enter taxes either way */
  taxMode: "HT" | "TTC";
  vatRate: number | null; // null = no tax entered yet, blocks export
  notes: string;
  paymentTerms: string;
  /** Pro customisation of the printed document */
  branding?: Branding;
  /** seq id used to allocate the next invoice number locally */
  createdAt: number;
  paidAt: number | null;
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

/** Line amounts are computed in centimes to dodge float drift. */
export const lineTotal = (it: InvoiceItem) =>
  Math.round((Number(it.qty) || 0) * Math.round((Number(it.unitPrice) || 0) * 100)) / 100;

export const totals = (inv: Invoice): InvoiceTotals => {
  const sum = Math.round(inv.items.reduce((s, it) => s + lineTotal(it), 0) * 100) / 100;
  if (inv.vatRate === null) return { subtotal: sum, tax: 0, total: sum };
  const rate = inv.vatRate / 100;
  if (inv.taxMode === "TTC") {
    const subtotal = Math.round((sum / (1 + rate)) * 100) / 100;
    return { subtotal, tax: Math.round((sum - subtotal) * 100) / 100, total: sum };
  }
  const tax = Math.round(sum * rate * 100) / 100;
  return { subtotal: sum, tax, total: Math.round((sum + tax) * 100) / 100 };
};

export const EMPTY_ISSUER: Issuer = {
  name: "",
  activity: "",
  ice: "",
  if: "",
  rc: "",
  cnss: "",
  email: "",
  phone: "",
  address: "",
  bankName: "",
  rib: "",
};

export const EMPTY_CLIENT: Client = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  ice: "",
};

let seed = 0;
export const uid = () => `i${Date.now().toString(36)}${(seed++).toString(36)}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const nextNumber = (kind: Invoice["kind"], previous: Invoice[]): string => {
  const year = new Date().getFullYear();
  const prefix = kind === "invoice" ? "FAC" : "DEV";
  const same = previous.filter((p) => p.kind === kind && p.number.startsWith(`${prefix}-${year}-`));
  const max = same.reduce((m, p) => {
    const n = parseInt(p.number.split("-").pop() || "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(3, "0")}`;
};

export const newInvoice = (kind: Invoice["kind"], previous: Invoice[], issuer: Issuer): Invoice => {
  const date = todayISO();
  return {
    v: 1,
    kind,
    number: nextNumber(kind, previous),
    issueDate: date,
    dueDate: addDays(date, 30),
    status: "draft",
    currency: "MAD",
    language: "ar",
    issuer,
    client: { ...EMPTY_CLIENT },
    items: [{ id: uid(), description: "", qty: 1, unitPrice: 0 }],
    taxMode: "HT",
    vatRate: null,
    notes: "",
    paymentTerms: "الدفع بالتحويل البنكي خلال 30 يومًا من تاريخ الفاتورة، مع ذكر رقم الفاتورة في خانة البيان.",
    createdAt: Date.now(),
    paidAt: null,
  };
};

const str = (v: unknown, max = 400): string =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, max) : "";
const num = (v: unknown, min = 0, max = 10_000_000): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100));
};

/** Server-side sanitation: never trust the document received by the share API */
export const sanitizeInvoice = (raw: unknown): Invoice => {
  const r = (raw ?? {}) as Record<string, unknown>;
  const base = newInvoice(r.kind === "quote" ? "quote" : "invoice", [], EMPTY_ISSUER);
  const issuerRaw = (r.issuer ?? {}) as Record<string, unknown>;
  const clientRaw = (r.client ?? {}) as Record<string, unknown>;
  const items = Array.isArray(r.items) ? r.items.slice(0, 60) : [];
  const vat = typeof r.vatRate === "number" && r.vatRate >= 0 && r.vatRate <= 30 ? r.vatRate : null;
  const status = r.status === "sent" || r.status === "paid" ? r.status : "draft";
  return {
    ...base,
    kind: r.kind === "quote" ? "quote" : "invoice",
    number: str(r.number, 40) || base.number,
    issueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(r.issueDate)) ? String(r.issueDate) : base.issueDate,
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(r.dueDate)) ? String(r.dueDate) : base.dueDate,
    status,
    language: r.language === "fr" ? "fr" : "ar",
    issuer: {
      name: str(issuerRaw.name, 120),
      activity: str(issuerRaw.activity, 160),
      ice: str(issuerRaw.ice, 30),
      if: str(issuerRaw.if, 30),
      rc: str(issuerRaw.rc, 30),
      cnss: str(issuerRaw.cnss, 30),
      email: str(issuerRaw.email, 120),
      phone: str(issuerRaw.phone, 40),
      address: str(issuerRaw.address, 240),
      bankName: str(issuerRaw.bankName, 80),
      rib: str(issuerRaw.rib, 40),
    },
    client: {
      name: str(clientRaw.name, 120),
      company: str(clientRaw.company, 160),
      email: str(clientRaw.email, 120),
      phone: str(clientRaw.phone, 40),
      address: str(clientRaw.address, 240),
      ice: str(clientRaw.ice, 30),
    },
    items: items.map((it) => {
      const i = (it ?? {}) as Record<string, unknown>;
      return {
        id: str(i.id, 40) || uid(),
        description: str(i.description, 300),
        qty: num(i.qty, 0, 1_000_000),
        unitPrice: num(i.unitPrice, 0, 10_000_000),
      };
    }),
    taxMode: r.taxMode === "TTC" ? "TTC" : "HT",
    vatRate: vat,
    branding: (() => {
      const b = (r.branding ?? {}) as Record<string, unknown>;
      const accent = /^#[0-9a-fA-F]{6}$/.test(String(b.accent)) ? String(b.accent) : DEFAULT_BRANDING.accent;
      const logo = typeof b.logo === "string" && b.logo.startsWith("data:image/") && b.logo.length < 400_000 ? b.logo : "";
      return { accent, hideFooter: b.hideFooter === true, logo };
    })(),
    notes: str(r.notes, 2000),
    paymentTerms: str(r.paymentTerms, 600),
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
    paidAt: null,
  };
};
