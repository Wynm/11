"use client";

import type { Invoice } from "./invoice";
import { totals } from "./invoice";
import { num } from "./format";

/**
 * Collection toolkit. The real reason a freelancer doesn't get paid is that nobody
 * follows up. These templates turn a dashboard click into a professional chase message
 * in the client's own language, with the exact legal references that push a company
 * finance department to release the transfer.
 */

const money = (n: number) => `${num(n)} درهم`;

const fmt = (iso: string, lang: "ar" | "fr") =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(lang === "fr" ? "fr-MA" : "ar-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export type ReminderTone = "before" | "due" | "late" | "final";
export type ReminderChannel = "email" | "whatsapp";

export const REMINDER_LABELS: Record<ReminderTone, { ar: string; hint: string }> = {
  before: { ar: "تذكير قبل الاستحقاق", hint: "قبل 3 أيام — ودّي وبلا ضغط" },
  due: { ar: "يوم الاستحقاق", hint: "تذكير مهذّب مع تأكيد الاستلام" },
  late: { ar: "متأخرة — مطالبة رسمية", hint: "بعد الأجل، مع إشارة للمادة 78" },
  final: { ar: "مطالبة أخيرة", hint: "قبل اللجوء للإجراءات — نبرة حازمة" },
};

export function reminderFor(inv: Invoice, tone: ReminderTone, channel: ReminderChannel) {
  const t = totals(inv);
  const fr = inv.language === "fr";
  const ref = inv.number;
  const total = money(t.total);
  const due = fmt(inv.dueDate, inv.language);
  const client = inv.client.company || inv.client.name || (fr ? "Madame, Monsieur" : "السيد(ة)");
  const issuer = inv.issuer.name || "";
  const rib = inv.issuer.rib ? inv.issuer.rib.replace(/(\d{4})(?=\d)/g, "$1 ") : "";
  const bank = inv.issuer.bankName || "";

  if (fr) {
    const subject =
      tone === "final"
        ? `Mise en demeure — facture ${ref}`
        : tone === "late"
          ? `Rappel : facture ${ref} impayée`
          : `Facture ${ref} — ${total}`;
    const body =
      tone === "before"
        ? `Bonjour,\n\nJe me permets un rappel amical : la facture ${ref} d'un montant de ${total} arrive à échéance le ${due}.\n\nCoordonnées bancaires : ${bank} ${rib}\n\nMerci d'avance pour votre traitement.\n\nBien cordialement,\n${issuer}`
        : tone === "due"
          ? `Bonjour,\n\nSauf erreur de ma part, la facture ${ref} (${total}) est due aujourd'hui, ${due}.\n\nPouvez-vous me confirmer sa mise en paiement ?\n\nBien cordialement,\n${issuer}`
          : tone === "late"
            ? `Bonjour,\n\nMalgré mon rappel, la facture ${ref} d'un montant de ${total}, échue le ${due}, n'a pas été réglée. Conformément à l'article 78 de la loi 15-95 relative au code de commerce, les sommes dues entre professionnels portent intérêt de retard au-delà du délai convenu.\n\nJe vous remercie de procéder au règlement sous 8 jours.\n\nCordialement,\n${issuer}`
            : `Objet : mise en demeure de payer la facture ${ref}\n\nBonjour,\n\nEn dépit de mes précédentes relances, la facture ${ref} (${total}, échue le ${due}) demeure impayée.\n\nPar la présente, je vous mets en demeure de procéder au paiement sous 15 jours. À défaut, je me réserve le droit d'engager toute action de recouvrement, y compris judiciaire.\n\nCordialement,\n${issuer}`;
    return `${channel === "email" ? subject : subject}\n\n${channel === "email" ? body : body}`;
  }

  const subject =
    tone === "final"
      ? `إنذار بالأداء — فاتورة ${ref}`
      : tone === "late"
        ? `تذكير: فاتورة ${ref} غير مؤدّاة`
        : `الفاتورة ${ref} — ${total}`;

  const body =
    tone === "before"
      ? `السلام عليكم ${client}،\n\nتذكير ودّي فقط: الفاتورة ${ref} بمبلغ ${total} يحلّ أجلها في ${due}.\nالمعلومات البنكية: ${bank} ${rib}\n\nشكرًا لتعاونكم.\n\n${issuer}`
      : tone === "due"
        ? `السلام عليكم ${client}،\n\nبحسب سجلاتي، الفاتورة ${ref} بمبلغ ${total} مستحقة الأداء اليوم ${due}.\nهل يمكن تأكيد برمجة التحويل؟\n\nشكرًا لكم.\n\n${issuer}`
        : tone === "late"
          ? `السلام عليكم ${client}،\n\nرغم التذكير السابق، الفاتورة ${ref} بمبلغ ${total} التي حلّ أجلها في ${due} لم تُؤدَّ بعد. وفقًا للمادة 78 من مدونة التجارة (قانون 15-95)، تُستحق على المبالغ غير المؤدّاة بين المهنيين فوائد تأخير بعد الأجل المتفق عليه.\n\nأرجو برمجة الأداء داخل 8 أيام.\n\n${issuer}`
          : `الموضوع: إنذار بالأداء — الفاتورة ${ref}\n\nالسلام عليكم ${client}،\n\nرغم التذكيرات السابقة، الفاتورة ${ref} بمبلغ ${total} (أجلها ${due}) ما زالت غير مؤدّاة.\n\nبموجب هذه الرسالة أُنبّهكم إلى ضرورة الأداء داخل 15 يومًا. وفي حال عدم الاستجابة، أحتفظ بحقي في سلوك مساطر التحصيل، بما فيها القضائية.\n\n${issuer}`;

  return `${subject}\n\n${body}`;
}

export function whatsappLink(inv: Invoice, tone: ReminderTone) {
  const phone = (inv.client as { phone?: string }).phone || "";
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(reminderFor(inv, tone, "whatsapp"));
  return `https://wa.me/${digits}?text=${text}`;
}

export function gmailLink(inv: Invoice, tone: ReminderTone) {
  const to = inv.client.email || "";
  const subject = reminderFor(inv, tone, "email").split("\n")[0];
  const body = reminderFor(inv, tone, "email").split("\n").slice(2).join("\n");
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Which nudge is due today for this document, if any. */
export function dueTone(inv: Invoice): ReminderTone | null {
  if (inv.status === "paid" || inv.kind === "quote") return null;
  const today = new Date().toISOString().slice(0, 10);
  const days = Math.round((new Date(`${inv.dueDate}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86_400_000);
  if (days > 3) return null;
  if (days > 0) return "before";
  if (days === 0) return "due";
  if (days >= -14) return "late";
  return "final";
}
