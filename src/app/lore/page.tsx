"use client";
import Image from "next/image";
import { Suspense } from "react";
import Head from "next/head";
import HeroSection from "@/modules/lore/HeroSection";
import OriginStorySection from "@/modules/lore/OriginStorySection";
import IntroSection from "@/modules/lore/IntroSection";
import MissionSection from "@/modules/lore/MissionSection";
import BelpFooter from "@/components/Footer";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import VideoPreloader from "@/components/VideoPreloader";
import CriticalLoreCSS from "@/components/CriticalLoreCSS";

export default function LorePage() {
  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/videos/bg-lore.webm"
          as="video"
          type="video/webm"
        />
        <link
          rel="preload"
          href="/images/lore/hero-background.svg"
          as="image"
        />
      </Head>
      <main className="relative min-h-screen">
        <CriticalLoreCSS />
        <PerformanceMonitor />

        <VideoPreloader src="/videos/bg-lore.webm">
          {/* Optimized video with better loading strategy */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="fixed inset-0 w-full h-full object-cover object-center z-0"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          >
            <source src="/videos/bg-lore.webm" type="video/webm" />
            <source src="/videos/bg-lore.mp4" type="video/mp4" />
          </video>
        </VideoPreloader>

        <div className="relative z-20 min-h-screen top-36">
          {/* Critical background image - load immediately */}
          <div className="absolute inset-0">
            <Image
              src="/images/lore/hero-background.svg"
              alt="Hero Background"
              fill
              className="object-cover object-center"
              sizes="100vw"
              quality={75}
              priority
            />
          </div>

          {/* Content layer - Critical LCP content */}
          <div className="relative z-10 bottom-20 md:bottom-10">
            <HeroSection />
          </div>
        </div>

        <div className="relative z-20 bg-gradient-to-b from-pink-100 to-purple-100">
          <div className="main-container py-16">
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <OriginStorySection />
            </Suspense>
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <IntroSection />
            </Suspense>
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <MissionSection />
            </Suspense>
          </div>
          <div className="relative w-full h-auto">
            <Image
              src="/images/lore/belpy-friends.png"
              alt="Belpy Friends"
              width={1200}
              height={600}
              className="w-full h-auto object-contain"
              loading="lazy"
              quality={75}
            />
          </div>
          <Suspense
            fallback={<div className="h-32 bg-gray-100 animate-pulse" />}
          >
            <BelpFooter />
          </Suspense>
        </div>
      </main>
    </>
  );
}
