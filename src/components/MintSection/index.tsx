'use client'
import { motion } from 'framer-motion'

export default function MintSection() {
  return (
    <section className='py-20 px-4 flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-100 to-violet-100 rounded-3xl shadow-lg mb-16'>
      <motion.h2
        className='text-3xl font-bold mb-4 text-center'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Mint Your BELP Cat Now!
      </motion.h2>
      <motion.p
        className='text-center text-lg text-gray-700 mb-8'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Connect your wallet and mint the cutest NFT on Solana.
      </motion.p>
      <motion.button
        className='px-8 py-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all'
        whileTap={{ scale: 0.95 }}
      >
        Mint Now
      </motion.button>
    </section>
  )
}
