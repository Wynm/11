"use client";

import type { Invoice } from "@/lib/invoice";
import { lineTotal, totals } from "@/lib/invoice";
import { amountInArabicWords, formatDate, num, percentLabel } from "@/lib/format";

export const A4_W = 794;
export const A4_H = 1123;
const PAD = 54;

/**
 * The single source of truth for the document.
 * Rendered in the editor preview, the public share page, and the print/PDF window.
 */
export function InvoiceSheet({ inv, scale = 1 }: { inv: Invoice; scale?: number }) {
  const t = totals(inv);
  const isFr = inv.language === "fr";
  const isQuote = inv.kind === "quote";
  const L = isFr
    ? {
        billTo: "Facturé à",
        issuer: "Prestataire",
        number: "N°",
        date: "Date",
        due: "Échéance",
        desc: "Désignation",
        qty: "Qté",
        price: "P.U. (MAD)",
        amount: "Montant (MAD)",
        subtotal: "Total HT",
        tax: "TVA",
        total: "Total TTC",
        noTax: "TVA non applicable",
        notes: "Remarques",
        terms: "Conditions de paiement",
        ice: "ICE",
        ifn: "IF",
        rc: "RC",
        cnss: "CNSS",
        rib: "RIB",
        words: "Arrêtée la présente facture à la somme de",
        signature: "Signature & cachet",
        footer: "Document généré avec Fatoura",
      }
    : {
        billTo: "السيد(ة) العميل(ة)",
        issuer: "المُصدِر",
        number: "رقم",
        date: "التاريخ",
        due: "تاريخ الاستحقاق",
        desc: "البيان",
        qty: "الكمية",
        price: "الثمن الفردي",
        amount: "المجموع",
        subtotal: "المجموع قبل الضريبة",
        tax: "الضريبة على القيمة المضافة",
        total: "المجموع للدفع",
        noTax: "الضريبة غير مطبقة",
        notes: "ملاحظات",
        terms: "شروط الأداء",
        ice: "ICE",
        ifn: "IF",
        rc: "RC",
        cnss: "CNSS",
        rib: "RIB",
        words: "أُوقفت هذه الفاتورة على مبلغ",
        signature: "التوقيع والخاتم",
        footer: "أُنجز بواسطة فاتورا",
      };

  const rows = inv.items.filter((i) => i.description.trim() || i.unitPrice > 0);
  const accent = inv.branding?.accent || "#0B5D50";
  const logo = inv.branding?.logo || "";
  const hideFooter = inv.branding?.hideFooter === true;
  const wordsLabel =
    inv.language === "fr"
      ? `${L.words} ${amountInArabicWords(t.total)}`
      : `${L.words}: ${amountInArabicWords(t.total)} فقط.`;
  const party = (title: string, lines: { k?: string; v: string; strong?: boolean }[]) => (
    <div style={{ border: "1px solid #E6E0D6", borderRadius: 12, padding: "14px 16px", background: "#FCFAF6", minWidth: 0 }}>
      <div style={{ fontSize: 9.5, letterSpacing: 1.2, color: accent, fontWeight: 700, marginBottom: 8 }}>
        {title}
      </div>
      {lines
        .filter((l) => l.v)
        .map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 6, fontSize: 12.5, lineHeight: 1.7, marginTop: i === 0 ? 0 : 1 }}>
            {l.k ? <span style={{ color: "#6B7683", minWidth: 30 }}>{l.k}</span> : null}
            <span style={{ fontWeight: l.strong ? 800 : 500, overflowWrap: "anywhere" }}>{l.v}</span>
          </div>
        ))}
    </div>
  );

  const netLabel = inv.taxMode === "TTC" ? (isFr ? " (extrait du TTC)" : " (مستخرج من TTC)") : "";

  return (
    <div
      dir={isFr ? "ltr" : "rtl"}
      lang={isFr ? "fr" : "ar"}
      style={{
        width: A4_W,
        minHeight: A4_H,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        background: "#fff",
        color: "#12171D",
        fontFamily: "Tajawal, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: `${PAD}px ${PAD}px ${PAD - 12}px`,
        boxSizing: "border-box",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, borderBottom: "2px solid #12171D", paddingBottom: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
          <div
            style={{
              width: 46, height: 46, borderRadius: 12, background: accent, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (inv.issuer.name || "F").trim().slice(0, 1).toUpperCase()
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.15 }}>{inv.issuer.name || (isFr ? "Votre nom" : "اسمك هنا")}</div>
            <div style={{ fontSize: 11, color: "#6B7683", marginTop: 3 }}>{inv.issuer.activity}</div>
            <div style={{ fontSize: 10.5, color: "#6B7683", marginTop: 2 }}>
              {[inv.issuer.address, inv.issuer.phone, inv.issuer.email].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ textAlign: isFr ? "right" : "left", flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: -0.5 }}>
            {isQuote ? (isFr ? "DEVIS" : "عرض ثمن") : isFr ? "FACTURE" : "فاتورة"}
          </div>
          <div style={{ fontSize: 12, color: "#6B7683", marginTop: 8, direction: "ltr", textAlign: isFr ? "right" : "left" }}>
            {L.number} {inv.number}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 7, fontSize: 11.5, justifyContent: isFr ? "flex-end" : "flex-start" }}>
            <span><span style={{ color: "#6B7683" }}>{L.date}: </span>{formatDate(inv.issueDate, inv.language)}</span>
            <span><span style={{ color: "#6B7683" }}>{L.due}: </span>{formatDate(inv.dueDate, inv.language)}</span>
          </div>
        </div>
      </div>

      {/* parties */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
        {party(L.billTo, [
          { v: inv.client.company || inv.client.name || (isFr ? "Client" : "العميل"), strong: true },
          { k: L.ice, v: inv.client.ice },
          { v: inv.client.company && inv.client.name ? inv.client.name : "" },
          { v: inv.client.address },
          { v: inv.client.email },
        ])}
        {party(L.issuer, [
          { k: L.ice, v: inv.issuer.ice, strong: true },
          { k: L.ifn, v: inv.issuer.if },
          { k: L.rc, v: inv.issuer.rc },
          { k: L.cnss, v: inv.issuer.cnss },
        ])}
      </div>

      {/* table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 22, tableLayout: "fixed" }}>
        <thead>
          <tr style={{ background: accent, color: "#fff" }}>
            <th style={{ width: 30, padding: "9px 8px", fontSize: 10.5, fontWeight: 700, textAlign: "center" }}>#</th>
            <th style={{ padding: "9px 10px", fontSize: 10.5, fontWeight: 700, textAlign: isFr ? "left" : "right" }}>{L.desc}</th>
            <th style={{ width: 54, padding: "9px 8px", fontSize: 10.5, fontWeight: 700, textAlign: "center" }}>{L.qty}</th>
            <th style={{ width: 100, padding: "9px 8px", fontSize: 10.5, fontWeight: 700, textAlign: isFr ? "right" : "left" }}>{L.price}</th>
            <th style={{ width: 106, padding: "9px 8px", fontSize: 10.5, fontWeight: 700, textAlign: isFr ? "right" : "left" }}>{L.amount}</th>
          </tr>
        </thead>
        <tbody>
          {(rows.length ? rows : [{ id: "x", description: "—", qty: 0, unitPrice: 0 }]).map((it, i) => (
            <tr key={it.id} style={{ background: i % 2 ? "#FCFAF6" : "#fff" }}>
              <td style={{ padding: "10px 8px", fontSize: 11.5, textAlign: "center", color: "#6B7683", borderBottom: "1px solid #EFEAE1" }}>{i + 1}</td>
              <td style={{ padding: "10px 10px", fontSize: 12.5, fontWeight: 500, borderBottom: "1px solid #EFEAE1", overflowWrap: "anywhere" }}>{it.description || "—"}</td>
              <td style={{ padding: "10px 8px", fontSize: 11.5, textAlign: "center", borderBottom: "1px solid #EFEAE1" }} className="tnum">{it.qty}</td>
              <td style={{ padding: "10px 8px", fontSize: 11.5, textAlign: isFr ? "right" : "left", borderBottom: "1px solid #EFEAE1", direction: "ltr" }} className="tnum">{num(it.unitPrice)}</td>
              <td style={{ padding: "10px 8px", fontSize: 11.5, fontWeight: 700, textAlign: isFr ? "right" : "left", borderBottom: "1px solid #EFEAE1", direction: "ltr" }} className="tnum">{num(lineTotal(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* summary + notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 18, marginTop: 16 }}>
        <div style={{ fontSize: 10.5, color: "#6B7683", lineHeight: 1.75 }}>
          {inv.issuer.rib ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#12171D", fontWeight: 800, fontSize: 10, marginBottom: 2 }}>{L.rib}</div>
              {inv.issuer.bankName ? `${inv.issuer.bankName} — ` : ""}
              <span style={{ direction: "ltr", unicodeBidi: "embed" }}>{inv.issuer.rib}</span>
            </div>
          ) : null}
          {inv.paymentTerms ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#12171D", fontWeight: 800, fontSize: 10, marginBottom: 2 }}>{L.terms}</div>
              {inv.paymentTerms}
            </div>
          ) : null}
          {inv.notes ? (
            <div>
              <div style={{ color: "#12171D", fontWeight: 800, fontSize: 10, marginBottom: 2 }}>{L.notes}</div>
              {inv.notes}
            </div>
          ) : null}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "5px 0", color: "#4A5560" }}>
            <span>{L.subtotal}{netLabel}</span>
            <span className="tnum" style={{ fontWeight: 700, direction: "ltr" }}>{num(t.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "5px 0", color: "#4A5560", borderBottom: "1px solid #EFEAE1" }}>
            <span>{inv.vatRate === null ? L.noTax : `${L.tax} (${percentLabel(inv.vatRate)})`}</span>
            <span className="tnum" style={{ fontWeight: 700, direction: "ltr" }}>{inv.vatRate === null ? "—" : num(t.tax)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "2px solid #12171D", marginTop: 2, paddingTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{L.total}</span>
            <span className="tnum" style={{ fontSize: 17, fontWeight: 800, color: accent, direction: "ltr" }}>{num(t.total)} MAD</span>
          </div>
        </div>
      </div>

      {/* amount in words */}
      {t.total > 0 ? (
        <div style={{ marginTop: 16, background: accent, color: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 11.5, lineHeight: 1.7, textAlign: isFr ? "left" : "right" }}>
          {isQuote ? (
            <span style={{ fontWeight: 700 }}>{wordsLabel}</span>
          ) : (
            <>
              <span style={{ color: "#E0A03C", fontWeight: 700 }}>{L.words}: </span>
              <span style={{ fontWeight: 700 }}>{amountInArabicWords(t.total)}</span>
              <span> فقط.</span>
            </>
          )}
        </div>
      ) : null}

      {/* signature */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: isFr ? "flex-end" : "flex-start" }}>
        <div style={{ width: 200, height: 74, border: "1px dashed #B9B2A6", borderRadius: 10, padding: 9, fontSize: 9.5, color: "#6B7683" }}>
          {L.signature}
        </div>
      </div>

      {/* footer */}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #E6E0D6", display: "flex", justifyContent: "space-between", gap: 10, fontSize: 8.5, color: "#8A8378" }}>
        <span>{[inv.issuer.name, inv.issuer.ice && `ICE ${inv.issuer.ice}`, inv.issuer.if && `IF ${inv.issuer.if}`].filter(Boolean).join(" · ")}</span>
        {hideFooter ? null : <span>{L.footer}</span>}
      </div>
    </div>
  );
}
