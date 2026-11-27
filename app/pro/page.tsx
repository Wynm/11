import type { Metadata } from "next";
import { SubscribePage } from "@/components/subscribe-page";

export const metadata: Metadata = {
  title: "فاتورا برو — شعارك وألوانك على كل فاتورة",
  description: "فعّل فاتورا برو: هوية بصرية خاصة، مستندات غير محدودة، ومفتاح تفعيل يعمل دون إنترنت. 399 د.م/سنة.",
};

export default function Page() {
  return <SubscribePage />;
}
