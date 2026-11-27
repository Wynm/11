import type { Metadata } from "next";
import { InvoiceEditor } from "@/components/editor/invoice-editor";
import { SeedDemo } from "@/components/editor/seed-demo";

export const metadata: Metadata = {
  title: "محرّر الفاتورة",
  description: "أنشئ فاتورة أو عرض ثمن بالعربية أو الفرنسية، مع فحص قانوني فوري وتصدير PDF.",
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; from?: string; edit?: string; demo?: string }>;
}) {
  const sp = await searchParams;
  const kind = sp.kind === "quote" ? "quote" : "invoice";
  const from = sp.from ? sp.from.slice(0, 40) : null;
  const edit = sp.edit && /^\d{10,16}$/.test(sp.edit) ? Number(sp.edit) : null;
  return (
    <>
      <SeedDemo enabled={sp.demo === "1"} />
      <InvoiceEditor initialKind={kind} fromNumber={from} editKey={edit} />
    </>
  );
}
