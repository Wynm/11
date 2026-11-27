"use client";

import type { Invoice } from "@/lib/invoice";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** All app stylesheets, with relative asset URLs made absolute so about:blank can load them. */
function collectCss() {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const base = sheet.href;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      let text = rule.cssText;
      if (base) {
        text = text.replace(/url\((['"]?)([^'")]+)\1\)/g, (_m, q: string, p: string) => {
          try {
            return `url(${q}${new URL(p, base).href}${q})`;
          } catch {
            return `url(${q}${p}${q})`;
          }
        });
      }
      out.push(text);
    }
  }
  return out.join("\n");
}

const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Tajawal, system-ui, sans-serif; }
  #print-root { width: 794px; }
  #print-root .invoice-sheet { transform: none !important; }
  .tnum { font-variant-numeric: tabular-nums; }
`;

/** The actual A4 page element (the scaled wrapper is only a viewport). */
const sheetNode = () =>
  document.querySelector<HTMLElement>("[data-invoice-sheet] > div") as HTMLElement | null;

export async function printInvoice(inv: Invoice) {
  const node = sheetNode();
  if (!node) return false;
  try {
    await document.fonts.ready;
  } catch {
    /* older engines */
  }

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.minHeight = "1123px";

  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) return false;
  w.document.open();
  w.document.write(
    `<!doctype html><html lang="${inv.language}" dir="${inv.language === "fr" ? "ltr" : "rtl"}"><head><meta charset="utf-8"/>
     <title>${esc(inv.kind === "quote" ? "Devis" : "Facture")} ${esc(inv.number)}</title>
     <style>${collectCss()}</style><style>${PRINT_CSS}</style></head>
     <body><div id="print-root">${clone.outerHTML}</div></body></html>`,
  );
  w.document.close();

  const close = () => {
    try {
      w.close();
    } catch {
      /* already gone */
    }
  };
  const go = async () => {
    try {
      await w.document.fonts.ready;
      w.focus();
      w.print();
    } catch {
      /* the user can still print manually from the opened window */
    }
    setTimeout(close, 1200);
  };
  if (w.document.readyState === "complete") setTimeout(go, 400);
  else w.addEventListener("load", () => setTimeout(go, 400), { once: true });
  return true;
}

export async function downloadPDF(inv: Invoice) {
  const node = sheetNode();
  if (!node) return false;
  const { toPng } = await import("html-to-image");
  const { jsPDF } = await import("jspdf");

  const prev = { transform: node.style.transform, minHeight: node.style.minHeight };
  node.style.transform = "none";
  node.style.minHeight = "1123px";
  let dataUrl = "";
  try {
    await document.fonts.ready.catch(() => undefined);
    dataUrl = await toPng(node, {
      pixelRatio: 2.2,
      backgroundColor: "#ffffff",
      width: 794,
      height: 1123,
      skipAutoScale: true,
    });
  } finally {
    node.style.transform = prev.transform;
    node.style.minHeight = prev.minHeight;
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  pdf.save(`${inv.kind === "quote" ? "DEVIS" : "FACTURE"}-${inv.number}.pdf`);
  return true;
}
