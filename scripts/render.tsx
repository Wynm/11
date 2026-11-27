import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { InvoiceSheet } from "@/components/invoice-sheet";
import { sample } from "./sample";

const page = (body: string, dir: string, lang: string) => `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<style>@font-face{font-family:'Tajawal';src:url('file:///home/user/11/node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2') format('woff2');font-weight:400}
@font-face{font-family:'Tajawal';src:url('file:///home/user/11/node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2') format('woff2');font-weight:700}
@font-face{font-family:'Tajawal';src:url('file:///home/user/11/node_modules/@fontsource/tajawal/files/tajawal-arabic-800-normal.woff2') format('woff2');font-weight:800}
*{box-sizing:border-box} body{margin:0;background:#eee;font-family:Tajawal,sans-serif} .tnum{font-variant-numeric:tabular-nums}
</style></head><body>${body}</body></html>`;

const ar = renderToStaticMarkup(React.createElement(InvoiceSheet, { inv: sample }));
const fr = renderToStaticMarkup(React.createElement(InvoiceSheet, { inv: { ...sample, language: "fr" } }));
const quote = renderToStaticMarkup(React.createElement(InvoiceSheet, { inv: { ...sample, kind: "quote", number: "DEV-2026-004", vatRate: null, client: { company: "", name: "", email: "", phone: "", address: "", ice: "" }, items: [{ id: "q", description: "شعار وهوية بصرية", qty: 1, unitPrice: 3500 }] } }));

writeFileSync("/tmp/rt/ar.html", page(ar, "rtl", "ar"));
writeFileSync("/tmp/rt/fr.html", page(fr, "ltr", "fr"));
writeFileSync("/tmp/rt/quote.html", page(quote, "rtl", "ar"));
console.log("ar", ar.length, "fr", fr.length, "quote", quote.length);
console.log(ar.slice(0, 400));
console.log("---summary---");
console.log(ar.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 1400));
