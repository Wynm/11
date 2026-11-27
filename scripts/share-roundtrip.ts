import { encodeDoc, decodeDoc } from "@/lib/share";
import { sample } from "./sample";

(async () => {
  const payload = await encodeDoc(sample as never);
  console.log("payload chars:", payload.length, "| kind:", payload[0]);
  const back = await decodeDoc(payload);
  console.log("roundtrip ok:", JSON.stringify(back) === JSON.stringify(sample));
  console.log("number:", back.number, "| items:", back.items.length);
  const url = `https://fatoura.ma/i/self#d=${payload}`;
  console.log("url length:", url.length, url.length < 1800 ? "(fits everywhere)" : "(LONG)");
})();
