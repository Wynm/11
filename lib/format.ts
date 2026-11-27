import type { Invoice } from "./invoice";
import { totals } from "./invoice";

const fmtNumber = (n: number) =>
  new Intl.NumberFormat("ar-MA-u-nu-latn", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

/** Number only — UI composes it next to a currency token inside an LTR wrapper. */
export const num = (n: number) => fmtNumber(n);

export const money = (n: number) => `${fmtNumber(n)} د.م`;

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو",
  "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر",
];

export const formatDate = (iso: string, lang: "ar" | "fr" = "ar") => {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return iso;
  if (lang === "fr") {
    return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`;
  }
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
};

/** Arabic number-to-words for amounts — the classic "arrêtée la présente facture à la somme de" block */
const ONES = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
const TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const HUNDREDS = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

const under1000 = (n: number): string => {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest) {
    if (rest < 20) parts.push(ONES[rest]);
    else {
      const u = rest % 10;
      const t = Math.floor(rest / 10);
      parts.push(u ? `${ONES[u]} و${TENS[t]}` : TENS[t]);
    }
  }
  return parts.join(" و");
};

export const amountInArabicWords = (amount: number): string => {
  const total = Math.round(amount * 100);
  const dirhams = Math.floor(total / 100);
  const cents = total % 100;

  const chunk = (n: number, one: string, two: string, few: string, many: string): string => {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return `${under1000(n)} ${few}`;
    return `${under1000(n)} ${many}`;
  };

  const parts: string[] = [];
  const millions = Math.floor(dirhams / 1_000_000);
  const thousands = Math.floor((dirhams % 1_000_000) / 1000);
  const units = dirhams % 1000;

  if (millions) parts.push(chunk(millions, "مليون", "مليونان", "ملايين", "مليون"));
  if (thousands) parts.push(chunk(thousands, "ألف", "ألفان", "آلاف", "ألف"));
  if (units) parts.push(under1000(units));

  let out = "";
  if (dirhams === 1) out = "درهم واحد";
  else if (dirhams === 2) out = "درهمان";
  else if (dirhams >= 3) {
    const last2 = dirhams % 100;
    const unit = last2 >= 3 && last2 <= 10 ? "دراهم" : last2 >= 11 ? "درهماً" : "درهم";
    out = `${parts.join(" و")} ${unit}`;
  }

  if (cents) {
    const c = cents === 1 ? "سنتيم واحد" : `${under1000(cents)} سنتيم`;
    out = out ? `${out} و${c}` : c;
  }
  return out || "صفر درهم";
};

export const percentLabel = (rate: number) => `${rate}٪`;

export const totalsLabel = (inv: Invoice) => {
  const t = totals(inv);
  return { ...t, subtotalText: num(t.subtotal), taxText: num(t.tax), totalText: num(t.total) };
};

export const statusLabels = {
  draft: { ar: "مسودة", fr: "Brouillon" },
  sent: { ar: "مُرسلة", fr: "Envoyée" },
  paid: { ar: "مُؤدّاة", fr: "Payée" },
} as const;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
