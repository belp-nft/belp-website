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

export default function GetTheCuteness() {
  const [stepIndex, setStepIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    let stopped = false;
    let raf: number | undefined;
    let timeout: NodeJS.Timeout | undefined;
    const start = rotation;
    let end = ((stepIndex + 1) * STEP) % 360;
    let realEnd = end;
    if (end < start) realEnd = end + 360;
    const duration = 1100;
    let startTime: number | null = null;
    setIsPaused(false);

    function animate(ts: number) {
      if (stopped) return;
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const percent = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - percent, 5);
      const value = start + (realEnd - start) * eased;
      setRotation(value % 360);
      if (percent < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setRotation(end % 360);
        setIsPaused(true);
        timeout = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % N);
        }, 1000);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line
  }, [stepIndex]);

  function getVisual(angle: number, isPaused: boolean) {
    let diff = (((angle - FOCUS_DEG) % 360) + 360) % 360;
    if (diff > 180) diff = 360 - diff;
    if (isPaused) {
      if (diff < STEP / 2)
        return { opacity: 1, filter: "none", zIndex: 20, scale: 1, size: 400 };
      return {
        opacity: 0.46,
        zIndex: 1,
        scale: 1,
        size: 200,
      };
    }

    return {
      opacity: 0.46,
      zIndex: 1,
      scale: 1,
      size: 200,
    };
  }

  const angles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  return (
    <section className="relative mx-auto my-20 max-w-[1440px] px-4 md:px-12 lg:px-28 py-20">
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-0">
        <div className="relative h-[500px] w-[500px] min-w-[220px] flex-shrink-0 flex items-center justify-start">
          <motion.div className="absolute left-[-172px] top-1/2 -translate-y-1/2 w-full h-full origin-left">
            {cats.map((item, i) => {
              const angle = angles[i];
              const actualAngle = (angle + rotation) % 360;
              const rad = (actualAngle * Math.PI) / 180;
              const x = Math.cos(rad) * R;
              const y = Math.sin(rad) * R;
              const visual = getVisual(actualAngle, isPaused);
              return (
                <div
                  key={item}
                  className="absolute transition-all"
                  style={{
                    left: `calc(0px + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) scale(${visual.scale})`,
                    opacity: visual.opacity,
                    filter: visual.filter,
                    zIndex: visual.zIndex,
                    transition:
                      "opacity .5s, filter .5s, z-index .2s, transform .5s, width .5s, height .5s",
                  }}
                >
                  <Image
                    src={`/icons/${item}`}
                    alt=""
                    width={visual.size}
                    height={visual.size}
                    className="rounded-2xl shadow-lg transition-all duration-500"
                  />
                </div>
              );
            })}
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left pl-0 md:pl-12">
          <motion.h2
            className={clsx(
              "text-4xl sm:text-5xl lg:text-[64px] font-bold mb-4",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Get the cuteness
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-8 max-w-xl text-[#1C007C]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Belpy consists of 100 rare Genesis NFTs and 9,900 General collection
            NFTs, featuring over 550 customizable traits and meticulously
            handcrafted, high-quality designs.
          </motion.p>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl max-w-xl text-[#1C007C]"
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
  );
}
