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
  ProofStrip,
  ProBanner,
  UseCases,
} from "@/components/sections";
import { LeadCapture } from "@/components/lead-capture";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProofStrip />
        <PainStrip />
        <HowItWorks />
        <Features />
        <Compliance />
        <UseCases />
        <LeadCapture />
        <Pricing />
        <ProBanner />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
