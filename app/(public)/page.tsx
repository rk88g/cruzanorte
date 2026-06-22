import type { Metadata } from "next";
import { DifficultCasesSection } from "@/components/sections/DifficultCasesSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TimelinePreviewSection } from "@/components/sections/TimelinePreviewSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";

export const metadata: Metadata = {
  title: "Tu camino al norte empieza aqui",
  description:
    "Acompanamiento profesional para organizar documentacion, revisar informacion y dar seguimiento por etapas a tu proceso."
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <ServicesSection />
      <DifficultCasesSection />
      <TimelinePreviewSection />
      <WhyChooseSection />
      <ReviewsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
