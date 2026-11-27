import { sanitizeInvoice, totals } from "@/lib/invoice";
import { complianceChecks } from "@/lib/compliance";
import { sample } from "./sample";
import { amountInArabicWords } from "@/lib/format";
import { reminderFor, dueTone } from "@/lib/reminders";

const base = sanitizeInvoice(sample);

// 1. HT → TTC with 20% VAT
const ht = totals({ ...base, taxMode: "HT", vatRate: 20 });
console.log("HT mode  :", ht, "expected 4200/840/5040");

// 2. TTC input: 5040 inclusive
const ttc = totals({ ...base, taxMode: "TTC", vatRate: 20, items: [{ id: "a", description: "x", qty: 1, unitPrice: 5040 }] });
console.log("TTC mode :", ttc, "expected subtotal 4200, tax 840, total 5040");

// 3. VAT rates
for (const r of [20, 14, 10, 7, 0]) {
  const t = totals({ ...base, taxMode: "HT", vatRate: r, items: [{ id: "a", description: "x", qty: 3, unitPrice: 333.33 }] });
  console.log(`rate ${String(r).padStart(2)}%:`, t);
}

// 4. no tax
console.log("no tax   :", totals({ ...base, vatRate: null }));

// 5. rounding stress: 0.01 × 3 at 20%
const tiny = totals({ ...base, taxMode: "HT", vatRate: 20, items: [{ id: "a", description: "x", qty: 3, unitPrice: 0.01 }] });
console.log("tiny     :", tiny);

// 6. compliance on the sample + on an empty doc
const empty = sanitizeInvoice({});
console.log("\nsample failing:", complianceChecks(base).filter((c) => !c.ok).map((c) => c.id));
console.log("empty failing :", complianceChecks(empty).filter((c) => !c.ok).map((c) => c.id));

// 7. words
console.log("\nwords 5040:", amountInArabicWords(5040));
console.log("words 0.01:", amountInArabicWords(0.01));

// 8. reminders for a late doc
const late = { ...base, dueDate: "2026-10-01", issueDate: "2026-09-01" };
console.log("\ntone for overdue doc:", dueTone(late as never));
console.log(reminderFor(late as never, "late", "email").split("\n").slice(0, 3).join(" | "));
