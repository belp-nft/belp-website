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
  return (
    <section
      className={clsx(
        "relative text-center",
        "px-6 sm:px-10 md:px-20 lg:px-[224px] py-12 md:py-16 lg:py-[60px] mt-10"
      )}
    >
      <motion.h1
        className={clsx(
          "font-bold mb-4 title-text",
          "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
        )}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        What is BELP
      </motion.h1>
      <p className="mb-[92px] large-text-container">
        Meet Belp, the adorable Web3-born character that's taking the digital
        universe by storm. Born from the cosmic dreams of creators and the
        infinite imagination of the community.
      </p>

      <CatCarousel />
    </section>
  );
}
