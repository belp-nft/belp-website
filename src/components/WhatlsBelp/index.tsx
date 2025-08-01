"use client";
import { motion } from "framer-motion";

export default function WhatlsBelp() {
  return (
    <section className="bg-white rounded-3xl shadow-xl mx-auto max-w-2xl my-10 py-10 px-6 text-center">
      <motion.h2
        className="text-2xl font-bold mb-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        What is BELP
      </motion.h2>
      <p className="text-gray-600 mb-5">
        BELP is your gateway to the cutest Cat Kingdom NFT universe. Adopt,
        collect and write your own story!
      </p>
      <img
        src="/belp-logo.png"
        alt="Belp"
        className="w-24 mx-auto rounded-full shadow"
      />
    </section>
  );
}
