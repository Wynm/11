"use client";

import { useEffect } from "react";
import type { Invoice } from "@/lib/invoice";
import { store } from "@/lib/storage";

/** Visit /new?demo=1 once to load a realistic, fully-compliant sample into this browser. */
export function SeedDemo({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const issuer = {
      name: "يوسف بنعلي",
      activity: "تصوير منتجات ومحتوى بصري",
      ice: "002345678900012",
      if: "458670123",
      rc: "55287",
      cnss: "7712345",
      email: "youssef.benali@example.ma",
      phone: "+212 661 23 45 67",
      address: "شارع الحسن الثاني، حي النخيل، فاس",
      bankName: "Attijariwafa Bank",
      rib: "007 780 0001234567890123 45",
    };

    store.setIssuer(issuer);

    const demo: Omit<Invoice, "v"> & { v?: 1 } = {
      kind: "invoice",
      number: `FAC-${new Date().getFullYear()}-014`,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      status: "sent",
      currency: "MAD",
      language: "ar",
      issuer,
      client: {
        company: "Studio Nord SARL",
        name: "سارة المنصوري",
        email: "sara@studionord.ma",
        address: "حي المعاريف، الدار البيضاء",
        ice: "001234567800034",
      },
      items: [
        { id: "d1", description: "جلسة تصوير منتجات — 12 صورة معدّلة", qty: 1, unitPrice: 2800 },
        { id: "d2", description: "مونتاج وتسليم رقمي للفيديوهات", qty: 2, unitPrice: 700 },
      ],
      taxMode: "HT",
      vatRate: 20,
      notes: "شكرًا لثقتكم — التسليم خلال 48 ساعة عبر رابط خاص.",
      paymentTerms: "الدفع بالتحويل البنكي خلال 30 يومًا من تاريخ الفاتورة، مع ذكر رقم الفاتورة في خانة البيان.",
      createdAt: Date.now(),
      paidAt: null,
    };
    store.save({ ...(demo as Invoice), v: 1 });
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  }, [enabled]);

  return null;
}
