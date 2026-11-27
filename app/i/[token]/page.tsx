import type { Metadata } from "next";
import { SharedInvoice } from "@/components/shared-invoice";

export const metadata: Metadata = {
  title: "فاتورة مشتركة",
  robots: { index: false, follow: false },
};

export default async function SharedInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedInvoice token={token} />;
}
