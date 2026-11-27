import type { Metadata } from "next";
import { InvoicesDashboard } from "@/components/invoices-dashboard";

export const metadata: Metadata = {
  title: "فواتيري",
  description: "تابع فواتيرك وعروضك، اعرف المُحصّل والمعلّق، وأعد الإرسال بضغطة.",
};

export default function InvoicesPage() {
  return <InvoicesDashboard />;
}
