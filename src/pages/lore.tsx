import { GetServerSideProps } from "next";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import HeroSection from "@/modules/lore/HeroSection";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import VideoPreloader from "@/components/VideoPreloader";
import CriticalLoreCSS from "@/components/CriticalLoreCSS";
import clsx from "clsx";

// Dynamic imports cho non-critical components
const OriginStorySection = dynamic(
  () => import("@/modules/lore/OriginStorySection"),
  {
    loading: () => <></>,
    ssr: true,
  }
);

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
  const [cloudDuration, setCloudDuration] = useState(10);
  const [cloudX, setCloudX] = useState({ initial: "100vw", animate: "-100vw" });
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCloudDuration(6);
        setCloudX({ initial: "100vw", animate: "-300vw" });
        setCloudDuration(10);
        setCloudX({ initial: "100vw", animate: "-100vw" });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className={clsx("relative min-h-screen overflow-hidden")}>
      <CriticalLoreCSS />
      <PerformanceMonitor />

      <div className={clsx("bg-[url('/images/lore/background.svg')]")}>
        <div className={clsx("relative z-20 min-h-screen top-36")}>
          <motion.div
            className={clsx(
              "pointer-events-none select-none absolute left-0 top-20 w-[300vw] md:w-[100vw] h-40 md:h-60 -z-10 flex items-center"
            )}
            initial={{ x: cloudX.initial, opacity: 0 }}
            animate={{ x: cloudX.animate, opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: cloudDuration,
              ease: "linear",
              opacity: { duration: 1, delay: 0.2 },
            }}
            style={{ willChange: "transform" }}
            aria-hidden="true"
          >
            <div className={clsx("w-full flex justify-center")}>
              <Image
                src="/images/lore/clouds.svg"
                alt="Clouds"
                width={1920}
                height={180}
                className={clsx("select-none")}
                priority={false}
                draggable={false}
                style={{
                  width: "100%",
                  height: "auto",
                  filter: "brightness(1.05)",
                }}
              />
            </div>
          </motion.div>
          {/* Critical background image - load immediately */}
          <div className={clsx("absolute inset-0")}>
            <Image
              src="/images/lore/hero-background.svg"
              alt="Hero Background"
              fill
              className={clsx("object-cover object-center")}
              sizes="100vw"
              quality={75}
              priority
            />
          </div>

          {/* Content layer - Critical LCP content */}
          <div className={clsx("relative z-30 bottom-20 md:bottom-10")}>
            <HeroSection />
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "relative z-20 bg-gradient-to-b from-pink-100 to-purple-100"
        )}
      >
        <div className={clsx("main-container py-16")}>
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
        <div className={clsx("relative w-full h-auto")}>
          <Image
            src="/images/lore/belpy-friends.png"
            alt="Belpy Friends"
            width={1200}
            height={600}
            className={clsx("w-full h-auto object-contain")}
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
    console.error("Error fetching lore page data:", error);

    return {
      props: {
        initialData: null,
      },
    };
  }
};
