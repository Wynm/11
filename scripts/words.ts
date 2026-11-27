import { amountInArabicWords } from "@/lib/format";
for (const n of [0.5, 1, 2, 3, 11, 20, 21, 100, 200, 1000, 2000, 3000, 11000, 250000, 1000000, 1050.25, 5040])
  console.log(String(n).padStart(10), "→", amountInArabicWords(n));
