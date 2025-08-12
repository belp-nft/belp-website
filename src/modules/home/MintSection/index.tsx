"use client";
import clsx from "clsx";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function MintSection() {
  const controls = useAnimation();
  const imgRef = useRef(null);

  return (
    <section className="bg-gradient-to-b from-[#FFC3F920] via-[#FFC3F910] via-60% to-[#ED00FF]">
      <div className="main-container pt-40 w-full flex flex-col md:flex-row items-center justify-center">
        <Link href="/mint" className="md:w-1/3 w-full text-center">
          <motion.button
            className={clsx(
              "cursor-pointer",
              "bg-gradient-to-b from-[#C000FF] to-[#ED00FF] bg-clip-text text-transparent leading-tight",
              "font-bold text-[52px] sm:text-[64px] md:text-[72px] lg:text-[98px] xl:text-[138px] leading-tight hover:scale-105 transition-all mb-8 md:mb-0"
            )}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => controls.start({ scale: 1.05 })}
            onHoverEnd={() => controls.start({ scale: 1 })}
          >
            Mint <span className="text-nowrap">now !</span>
          </motion.button>
        </Link>

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
            src="/images/home/belp-cat-3.svg"
            alt="belp cat"
            width={620}
            height={700}
            priority
            draggable={false}
            className="max-w-[320px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] xl:max-w-[580px] h-auto"
          />
        </motion.div>

        <div className="w-full flex md:hidden justify-center items-end">
          <Image
            src="/gifs/cat-walk.gif"
            alt="belp cat walking"
            width={400}
            height={300}
            priority
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
