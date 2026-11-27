/**
 * The one file to edit before selling.
 *
 * Everything the buyer sees on /pro (price, bank details, WhatsApp, email) and on the
 * printable flyer lives here — so a new operator can go live by editing six lines.
 * No secrets belong in this file: it is client-side by design.
 */

export const BUSINESS = {
  /** WhatsApp number in international format, digits only (212…). */
  whatsapp: "212661234567",
  email: "bonjour@fatoura.ma",

  bank: {
    name: "Attijariwafa Bank",
    holder: "YOUSSEF BENALI",
    rib: "007780000123456789012345",
    display: "007 780 0001234567890123 45",
  },

  /** Prices in MAD. */
  price: { monthly: 49, yearly: 399 },
  /** Launch offer shown on the flyer; set to null to hide. */
  launch: { price: 249, label: "عرض الإطلاق — أول 20 مشترك", code: "AWWAL20" },

  site: process.env.NEXT_PUBLIC_SITE_URL || "https://fatoura.ma",
} as const;

export const waText = (text: string) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
export const mailto = (subject: string, body = "") =>
  `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
