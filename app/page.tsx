import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import {
  Compliance,
  Faq,
  Features,
  FinalCta,
  HowItWorks,
  PainStrip,
  Pricing,
  UseCases,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <PainStrip />
        <HowItWorks />
        <Features />
        <Compliance />
        <UseCases />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
