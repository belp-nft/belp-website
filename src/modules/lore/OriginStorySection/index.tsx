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
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-pink-100 to-purple-100 mb-24">
      <div className="mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.h1
            className={clsx(
              "font-oxanium font-bold mb-4 title-text",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.2,
              }}
            >
              {/* Story Image */}
              <div className="mb-10 flex justify-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                  <Image
                    src={story.image}
                    alt={story.image}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-4">
                <p className="leading-relaxed max-w-xs mx-auto">
                  {story.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
