"use client";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function MintSection() {
  const controls = useAnimation();
  const imgRef = useRef(null);

  return (
    <section className="pt-20 md:px-4 w-full flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto">
      <motion.button
        className="text-[#C000FF] font-bold text-[52px] sm:text-[72px] md:text-[98px] lg:text-[124px] xl:text-[138px] leading-tight hover:scale-105 transition-all md:w-1/3 w-full mb-8 md:mb-0"
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => controls.start({ scale: 1.05 })}
        onHoverEnd={() => controls.start({ scale: 1 })}
      >
        Mint now !
      </motion.button>

      <motion.div
        initial={{ x: 260, scale: 0.2, opacity: 0 }}
        whileInView={{ x: 0, scale: 1, opacity: 1 }}
        animate={controls}
        viewport={{ once: false, margin: "-100px" }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 15,
          mass: 0.7,
        }}
        className="w-full md:w-2/3 hidden md:flex justify-center items-end"
        style={{ minHeight: 320 }}
        ref={imgRef}
      >
        <Image
          src="/images/belp-cat-3.svg"
          alt="belp cat"
          width={684}
          height={700}
          priority
          draggable={false}
          className="max-w-[320px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[684px] h-auto"
        />
      </motion.div>

      <div className="w-full flex md:hidden justify-center items-end">
        <video
          src="/videos/cat-walk.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </section>
  );
}
