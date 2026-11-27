import type { Metadata } from "next";
import { IceValidator } from "@/components/tools/ice-validator";

export const metadata: Metadata = {
  title: "مدقق رقم ICE — 15 رقمًا أو فاتورتك مرتجعة",
  description:
    "افحص شكل رقم ICE (المعرّف المشترك للمقاولة) قبل إرسال الفاتورة: 15 رقمًا، بلا رموز، مع أسباب الرفض الشائعة ونسخ منسّق.",
  keywords: ["ICE", "رقم ICE", "OMPIC", "التحقق من ICE", "فاتورة"],
};

export default function Page() {
  return <IceValidator />;
}
