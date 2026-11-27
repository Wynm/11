import type { Metadata } from "next";
import { Collections } from "@/components/collections";

export const metadata: Metadata = {
  title: "التحصيل — ذكّر عميلك واستلم فلوسك",
  description: "كل فاتورة غير مؤدّاة في مكان واحد، مرتّبة بالأقدم، مع رسالة تذكير جاهزة بالعربية والفرنسية ومرجع المادة 78 من مدونة التجارة.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Collections />;
}
