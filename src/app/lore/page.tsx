"use client";
import Image from "next/image";
import HeroSection from "@/modules/lore/HeroSection";
import OriginStorySection from "@/modules/lore/OriginStorySection";
import IntroSection from "@/modules/lore/IntroSection";
import MissionSection from "@/modules/lore/MissionSection";
import BelpFooter from "@/components/Footer";
import clsx from "clsx";

export default function LorePage() {
  return (
    <main className="relative min-h-screen">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-center z-0"
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      >
        <source src="/videos/bg-lore.webm" type="video/webm" />
      </video>

      <div className="relative z-20 min-h-screen top-36">
        {/* Optimized background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/lore/hero-background.svg"
            alt="Hero Background"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={85}
            loading="lazy"
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10">
          <HeroSection />
        </div>
      </div>

      <div className="relative z-20 bg-gradient-to-b from-pink-100 to-purple-100">
        <div className="main-container py-16">
          <OriginStorySection />
          <IntroSection />
          <MissionSection />
        </div>
        <div className="relative w-full h-auto">
          <Image
            src="/images/lore/belpy-friends.png"
            alt="Belpy Friends"
            width={1200}
            height={600}
            className="w-full h-auto object-contain"
          />
        </div>
        <BelpFooter />
      </div>
    </main>
  );
}
