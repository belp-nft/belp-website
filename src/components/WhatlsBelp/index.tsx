"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import CatCarousel from "../CatCarousel";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function WhatlsBelp() {
  const [cloudConfigs, setCloudConfigs] = useState<
    {
      key: string;
      style: React.CSSProperties;
      animate: any;
      transition: any;
    }[]
  >([]);

  useEffect(() => {
    const configs: any = Array.from({ length: 6 }).map((_, idx) => {
      const top = rand(10, 80);
      const left = rand(10, 80);
      const width = rand(40, 90);
      const height = width * rand(0.5, 0.7);
      const opacity = rand(0.4, 0.8);
      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = Math.random() > 0.5 ? 1 : -1;
      const duration = rand(8, 14);
      const delay = rand(0, 6);

      return {
        key: `cloud-${idx}`,
        style: {
          top: `${top}%`,
          left: `${left}%`,
          width,
          height,
          opacity,
          zIndex: 10,
          pointerEvents: "none" as const,
          position: "absolute",
        },
        animate: {
          x: [0, 30 * dirX, 0, -30 * dirX, 0],
          y: [0, -20 * dirY, 0, 20 * dirY, 0],
        },
        transition: {
          duration,
          repeat: Infinity,
          repeatType: "loop" as const,
          ease: "easeInOut" as const,
          delay,
        },
      };
    });
    setCloudConfigs(configs);
  }, []);

  return (
    <section
      className={clsx(
        "relative text-center",
        "px-6 sm:px-10 md:px-20 lg:px-[224px] py-12 md:py-16 lg:py-[60px]"
      )}
    >
      <motion.h2
        className={clsx(
          "lg:text-[64px] font-bold mb-3",
          "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
        )}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        What is BELP
      </motion.h2>
      <p className="text-[#1C007C] mb-[92px]">
        Meet Belp, the adorable Web3-born character that's taking the digital
        universe by storm. Born from the cosmic dreams of creators and the
        infinite imagination of the community.
      </p>

      <CatCarousel />
    </section>
  );
}
