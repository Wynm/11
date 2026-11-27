import type { Metadata } from "next";
import { TvaCalculator } from "@/components/tools/tva-calculator";

export const metadata: Metadata = {
  title: "حاسبة الضريبة على القيمة المضافة TVA — المغرب",
  description:
    "احسب TVA 20٪ و14٪ و10٪ و7٪ من مبلغ HT أو استخرجها من TTC. حاسبة درهم مغربي بدقة السنتيم، مع جدول جاهز ونسخ النتيجة.",
  keywords: ["حاسبة TVA", "الضريبة على القيمة المضافة", "TVA Maroc", "HT TTC", "فاتورة"],
};

export default function Page() {
  return <TvaCalculator />;
}
