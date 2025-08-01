'use client'
import { motion } from 'framer-motion'

const roadmap = [
  {
    quarter: 'Q3 2024',
    title: 'Mint Launch',
    desc: 'Open mint for first BELP Cat Kingdom NFTs'
  },
  {
    quarter: 'Q4 2024',
    title: 'Marketplace',
    desc: 'Launch Cat NFT trading & profile features'
  },
  {
    quarter: 'Q1 2025',
    title: 'Cat Quests',
    desc: 'Gamify, quests, and rewards for holders'
  },
  {
    quarter: 'Q2 2025',
    title: 'DAO & Lore Expansion',
    desc: 'Community-driven lore and kingdom events'
  }
]

export default function Roadmap() {
  return (
    <section className='py-16 px-4 mb-12'>
      <motion.h2
        className='text-3xl font-bold text-center mb-4'
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Roadmap
      </motion.h2>
      <div className='max-w-2xl mx-auto'>
        {roadmap.map((item, i) => (
          <motion.div
            key={item.quarter}
            className='mb-6 p-6 rounded-2xl bg-white/80 shadow border-l-4 border-purple-400'
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className='font-bold text-purple-700'>{item.quarter}</div>
            <div className='text-lg font-semibold'>{item.title}</div>
            <div className='text-gray-500'>{item.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
