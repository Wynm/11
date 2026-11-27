import type { Metadata } from "next";
import { MentionsBuilder } from "@/components/tools/mentions-builder";

export const metadata: Metadata = {
  title: "مكوّنات الفاتورة المغربية — مولّد جاهز للنسخ",
  description:
    "اجمع ICE وIF وRC وCNSS والبنك في قالب مكوّنات جاهز للصق في Word أو Google Docs — العناصر التي يفحصها محاسب الشركة قبل الأداء.",
  keywords: ["mentions obligatoires facture", "ICE IF RC CNSS", "فاتورة المغرب", "قالب فاتورة"],
};

export default function Page() {
  return <MentionsBuilder />;
}
