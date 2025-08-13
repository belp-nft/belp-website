"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const cats = [
  "token-nft-1.svg",
  "token-nft-2.svg",
  "token-nft-3.svg",
  "token-nft-4.svg",
  "token-nft-5.svg",
];

const N = cats.length;
const R = 250;
const STEP = 360 / N;
const FOCUS_DEG = 45 - STEP;

// Carousel desktop effect
function DesktopCarousel() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  useEffect(() => {
    let stopped = false;
    let raf: number | undefined;
    let timeout: NodeJS.Timeout | undefined;
    const start = rotation;
    const nextIndex = (stepIndex + 1) % N;
    let end = (nextIndex * STEP) % 360;
    if (end <= start) end += 360;
    const duration = 1100;
    let startTime: number | null = null;
    setIsPaused(false);

    function animate(ts: number) {
      if (stopped) return;
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const percent = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - percent, 5);
      const value = start + (end - start) * eased;
      setRotation(value);
      if (percent < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setRotation((nextIndex * STEP) % 360);
        setIsPaused(true);
        timeout = setTimeout(() => {
          setStepIndex(nextIndex);
        }, 1000);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
  }, [stepIndex]);

  // Tính visual cho mỗi hình
  function getVisual(angle: number, isPaused: boolean) {
    let diff = (((angle - FOCUS_DEG) % 360) + 360) % 360;
    if (diff > 180) diff = 360 - diff;
    const scale =
      isPaused && diff < STEP / 2
        ? 1.15
        : 0.96 + 0.04 * Math.cos((diff / (STEP / 2)) * Math.PI);
    const opacity =
      isPaused && diff < STEP / 2
        ? 1
        : 0.46 + 0.54 * Math.cos((diff / (STEP / 2)) * Math.PI);
    if (isPaused) {
      if (diff < STEP / 2)
        return { opacity: 1, filter: "none", zIndex: 20, scale, size: 200 };
      return {
        opacity: 0.46,
        zIndex: 1,
        scale,
        size: 200,
      };
    }
    return {
      opacity: opacity,
      zIndex: 1,
      scale: scale,
      size: 200 + 30 * (1 - diff / 90),
    };
  }

  const angles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  return (
    <div className="h-[500px] w-1/2 flex-shrink-0 flex items-center justify-start">
      {isMounted ? (
        <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full origin-left">
          {cats.map((item, i) => {
            const angle = angles[i];
            const actualAngle = (angle + rotation) % 360;
            const rad = (actualAngle * Math.PI) / 180;
            const x = Math.cos(rad) * R;
            const y = Math.sin(rad) * R;
            const visual = getVisual(actualAngle, isPaused);

            let diff = (((actualAngle - FOCUS_DEG) % 360) + 360) % 360;
            if (diff > 180) diff = 360 - diff;
            let imgRotate = 0;
            if (diff < STEP / 2) {
              if (isPaused) {
                imgRotate = 0;
              } else {
                const maxTilt = 14;
                imgRotate = (diff / (STEP / 2)) * maxTilt;
              }
            } else {
              imgRotate = actualAngle;
            }

            return (
              <div
                key={item}
                className="absolute transition-all"
                style={{
                  left: `calc(0px + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) scale(${
                    visual.scale ?? 1
                  }) rotate(${imgRotate}deg)`,
                  opacity: String(visual.opacity ?? 1),
                  filter: visual.filter ? String(visual.filter) : "none",
                  zIndex: String(visual.zIndex ?? 1),
                  transition:
                    "opacity .5s, filter .5s, z-index .2s, transform .5s",
                }}
              >
                <Image
                  src={`/icons/${item}`}
                  alt=""
                  width={visual.size}
                  height={visual.size}
                  className="rounded-2xl shadow-lg transition-all duration-500"
                  draggable={false}
                />
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div style={{ width: 500, height: 500 }} />
      )}
    </div>
  );
}

export default function GetTheCuteness() {
  return (
    <div className="relative -mt-2 bg-white">
      <section className="main-container py-20 lg:py-32 w-full">
        <div className="w-full flex flex-col items-stretch md:hidden">
          <h2
            className="font-bold text-[28px] xs:text-[34px] sm:text-[40px] mb-4
          bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent px-2 pt-2"
            style={{
              fontFamily: "var(--font-oxanium) !important",
            }}
          >
            Get the cuteness
          </h2>
          <div className="flex flex-row w-full min-h-[300px]">
            <div className="relative flex-1 min-w-0" style={{ height: 230 }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute left-1 top-0"
                style={{ zIndex: 2, width: 82 }}
              >
                <Image
                  src="/icons/token-nft-2.svg"
                  alt="cat2"
                  width={82}
                  height={82}
                  className="rounded-2xl shadow-lg rotate-[-11deg] bg-[#ffe1fc] p-1"
                  draggable={false}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
                className="absolute left-8 top-32"
                style={{ zIndex: 1, width: 72 }}
              >
                <Image
                  src="/icons/token-nft-5.svg"
                  alt="cat5"
                  width={72}
                  height={72}
                  className="rounded-2xl shadow-lg rotate-[-6deg] bg-[#e6f4ff] p-1"
                  draggable={false}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 60 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ delay: 0.28, duration: 0.5, ease: "easeOut" }}
                className="absolute left-14 top-10"
                style={{ zIndex: 10, width: 122 }}
              >
                <Image
                  src="/icons/token-nft-1.svg"
                  alt="cat1"
                  width={122}
                  height={122}
                  className="rounded-2xl shadow-xl rotate-[7deg] bg-[#edf3ff] p-1"
                  draggable={false}
                />
              </motion.div>
              <div className="h-[200px] w-full" />
            </div>
            <div className="text-[15px] font-medium text-right max-w-[150px] sm:max-w-[200px] mt-6 pr-5">
              Belpy consists of 100 rare Genesis NFTs and 9,900 General
              collection NFTs, featuring over 550 customizable traits and
              meticulously handcrafted, high-quality designs.
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:flex-row items-center justify-between w-full">
          <DesktopCarousel />
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
            <motion.h2
              className={clsx(
                "title-text font-bold mb-4",
                "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                fontFamily: "var(--font-oxanium) !important",
              }}
            >
              Get the cuteness
            </motion.h2>
            <motion.p
              className="text-responsive-lg lg:text-2xl mb-8 max-w-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Belpy consists of 100 rare Genesis NFTs and 9,900 General
              collection NFTs, featuring over 550 customizable traits and
              meticulously handcrafted, high-quality designs.
            </motion.p>
            <motion.p
              className="text-responsive-lg lg:text-2xl max-w-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Each Belpy NFT serves as the main key that connects to all future
              content, unlocking unique value across the entire Belpy ecosystem,
              including games, merchandise, and token rewards.
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
}
