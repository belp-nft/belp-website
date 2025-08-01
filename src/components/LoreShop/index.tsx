'use client'
import { motion } from 'framer-motion'

export default function LoreShop() {
  return (
    <section className='py-16 px-4 bg-white rounded-3xl shadow-lg mb-12'>
      <motion.h2
        className='text-3xl font-bold text-center mb-4'
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Lore Shop
      </motion.h2>
      <motion.p
        className='text-center text-lg text-gray-700 mb-8'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Explore the story behind each BELP Cat NFT! Collect rare backgrounds,
        legendary accessories, and write your own cat kingdom lore.
      </motion.p>
      <div className='flex flex-wrap gap-6 justify-center'>
        {/* Demo items */}
        <motion.div
          className='bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl p-6 shadow'
          whileHover={{ scale: 1.07 }}
        >
          <div className='text-xl font-semibold mb-2'>Legendary Crown</div>
          <div className='text-gray-500'>Epic rarity</div>
        </motion.div>
        <motion.div
          className='bg-gradient-to-br from-yellow-200 to-pink-200 rounded-2xl p-6 shadow'
          whileHover={{ scale: 1.07 }}
        >
          <div className='text-xl font-semibold mb-2'>Royal Cape</div>
          <div className='text-gray-500'>Rare</div>
        </motion.div>
        <motion.div
          className='bg-gradient-to-br from-blue-100 to-violet-100 rounded-2xl p-6 shadow'
          whileHover={{ scale: 1.07 }}
        >
          <div className='text-xl font-semibold mb-2'>Crystal Amulet</div>
          <div className='text-gray-500'>Uncommon</div>
        </motion.div>
      </div>
    </section>
  )
}
