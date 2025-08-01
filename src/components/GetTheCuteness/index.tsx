'use client'
import { motion } from 'framer-motion'

export default function GetTheCuteness() {
  return (
    <section className='py-16 px-4 mb-12 bg-gradient-to-b from-fuchsia-50 to-white rounded-3xl shadow'>
      <motion.h2
        className='text-3xl font-bold text-center mb-4'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Get The Cuteness
      </motion.h2>
      <motion.p
        className='text-center text-lg text-gray-700 mb-8'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Mint your adorable Cat NFT and join the BELP Kingdom! Every cat is
        unique, with tons of possible traits and surprises.
      </motion.p>
      <div className='flex justify-center'>
        <motion.img
          src='/cat-nft-demo.png'
          alt='Cute NFT'
          className='w-40 h-40 object-contain rounded-full border-4 border-pink-200 shadow-lg'
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </section>
  )
}
