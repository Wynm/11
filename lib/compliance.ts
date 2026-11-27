import type { Invoice } from "./invoice";

/** Moroccan legal compliance checks for a facture (not a devis) */
export type Check = {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
  fix?: string;
};

export function complianceChecks(inv: Invoice): Check[] {
  const anyItem = inv.items.some((it) => it.unitPrice > 0 || it.description.trim());
  return [
    {
      id: "issuer-name",
      label: "اسمك أو اسم مقاولتك على الفاتورة",
      detail: "الاسم الكامل كما هو في السجل الوطني للمقاول الذاتي.",
      ok: inv.issuer.name.trim().length > 1,
      fix: "أضف اسمك في «بياناتك»",
    },
    {
      id: "address",
      label: "العنوان المهني",
      detail: "العنوان المصرح به لدى الإدارة.",
      ok: inv.issuer.address.trim().length > 2,
      fix: "أضف العنوان في «بياناتك»",
    },
    {
      id: "ice",
      label: "المعرّف المقاولاتي ICE (15 رقمًا)",
      detail: "إلزامي على كل فاتورة منذ 2019.",
      ok: /^\d{15}$/.test(inv.issuer.ice.replace(/\s/g, "")),
      fix: "أضف ICE في «بياناتك»",
    },
    {
      id: "if",
      label: "المعرّف الجبائي IF",
      detail: "يصدره مكتب الضرائب عند التسجيل.",
      ok: inv.issuer.if.trim().length >= 3,
      fix: "أضف IF في «بياناتك»",
    },
    {
      id: "client",
      label: "اسم العميل",
      detail: "فرد أو شركة، مع ICE إن كان العميل شركة.",
      ok: inv.client.name.trim().length > 1 || inv.client.company.trim().length > 1,
      fix: "املأ بيانات العميل",
    },
    {
      id: "number",
      label: "رقم فاتورة متسلسل",
      detail: "ترقيم متتالٍ بدون فراغات، يبدأ من 1 مع كل سنة.",
      ok: /^(FAC|DEV)-\d{4}-\d{3,}$/.test(inv.number),
      fix: "اترك الترقيم التلقائي مفعّلًا",
    },
    {
      id: "dates",
      label: "تاريخ الإصدار وتاريخ الاستحقاق",
      detail: "الاستحقاق لا يسبق الإصدار.",
      ok: !!inv.issueDate && inv.dueDate >= inv.issueDate,
      fix: "صحّح التاريخ",
    },
    {
      id: "amount",
      label: "مبلغ الفاتورة محدد",
      detail: "سطر واحد على الأقل بثمن أكبر من صفر.",
      ok: anyItem,
      fix: "أضف سطر الخدمة",
    },
    {
      id: "vat",
      label: "تحديد الضريبة على القيمة المضافة",
      detail: "20٪، أو 10٪/7٪ للنقل والفنادق، أو «بدون ضريبة» إن كنت غير خاضع.",
      ok: inv.vatRate !== null,
      fix: "اختر نسبة الضريبة أو «بدون ضريبة»",
    },
  ];
}

export const isCompliant = (inv: Invoice) => complianceChecks(inv).every((c) => c.ok);
