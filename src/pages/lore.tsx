import { GetServerSideProps } from 'next';
import Image from "next/image";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/modules/lore/HeroSection";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import VideoPreloader from "@/components/VideoPreloader";
import CriticalLoreCSS from "@/components/CriticalLoreCSS";

// Dynamic imports cho non-critical components
const OriginStorySection = dynamic(() => import("@/modules/lore/OriginStorySection"), {
  loading: () => <></>,
  ssr: true,
});

const IntroSection = dynamic(() => import("@/modules/lore/IntroSection"), {
  loading: () => <></>,
  ssr: true,
});

const MissionSection = dynamic(() => import("@/modules/lore/MissionSection"), {
  loading: () => <></>,
  ssr: true,
});

const BelpFooter = dynamic(() => import("@/components/Footer"), {
  loading: () => <></>,
  ssr: true,
});

interface LorePageProps {
  // Có thể thêm data từ server nếu cần
  initialData?: any;
}

export default function LorePage({ initialData }: LorePageProps) {
  return (
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
          preload="metadata"
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
          <Suspense fallback={<></>}>
            <OriginStorySection />
          </Suspense>
          <Suspense fallback={<></>}>
            <IntroSection />
          </Suspense>
          <Suspense fallback={<></>}>
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
        <Suspense fallback={<></>}>
          <BelpFooter />
        </Suspense>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Có thể fetch lore content từ API nếu cần
    // const loreData = await fetch('...');
    
    return {
      props: {
        // initialData: loreData,
      },
    };
  } catch (error) {
    console.error('Error fetching lore page data:', error);
    
    return {
      props: {
        initialData: null,
      },
    };
  }
};
