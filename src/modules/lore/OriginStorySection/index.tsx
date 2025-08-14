"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";

const stories = [
  {
    id: 1,
    image: "/images/lore/story-1.svg",
    description:
      "In a digital land considered to be the most luxurious place in the multiverse, lived a community of friendly Belp cats inspired by Belp.",
  },
  {
    id: 2,
    image: "/images/lore/story-2.svg",
    description:
      "They live this adventure goes from the depths of this magical universe to the outside world, full of friendship and experiences.",
  },
  {
    id: 3,
    image: "/images/lore/story-3.svg",
    description:
      "But one day they discovered a new land called Earth where they could be happy and start new adventures with their new friends. A story that continues to this day.",
  },
];

export default function OriginStorySection() {
  return (
    <motion.section
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-pink-100 to-purple-100"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.0, ease: "easeOut" }}
    >
      <motion.div
        className="mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.h1
            className={clsx(
              "font-oxanium font-bold mb-4 title-text",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
            style={{
              fontFamily: "var(--font-oxanium)",
            }}
          >
            The Origin Story
          </motion.h1>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              className="text-center"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.2,
              }}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
            >
              {/* Story Image */}
              <motion.div
                className="mb-10 flex justify-center"
                initial={{ opacity: 0, y: 80, scale: 0.5 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 1.0,
                  ease: "easeOut",
                  delay: index * 0.3,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: {
                    duration: 0.5,
                    rotate: { duration: 0.6, ease: "easeInOut" },
                  },
                }}
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                  <motion.div
                    whileHover={{
                      filter:
                        "drop-shadow(0 20px 25px rgba(243, 86, 255, 0.4))",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={story.image}
                      alt={`Story ${story.id}`}
                      fill
                      className="object-contain"
                      loading="lazy"
                      quality={75}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Story Content */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: index * 0.2 + 0.4,
                }}
              >
                <motion.p
                  className="leading-relaxed max-w-xs mx-auto"
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
                  {story.description}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
