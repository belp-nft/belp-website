"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import UserInfo from "@/modules/my-collection//UserInfo";
import NftGrid from "@/modules/my-collection//NftGrid";
import { makeMockItems, NftItem } from "@/lib/collection-mock";

const MyCollectionPage = () => {
  const allItems = useMemo<NftItem[]>(() => makeMockItems(88), []);
  const [visible, setVisible] = useState(20);

  const items = allItems.slice(0, visible);

  return (
    <main className="min-h-screen">
      <section className="relative w-full h-[414px] overflow-hidden">
        <Image
          src="/images/my-collection/collection-banner.png"
          alt="banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/60 pointer-events-none z-0" />
      </section>

      <section className="px-4 sm:px-6 lg:px-10 mt-4">
        <UserInfo
          username="GqPyxf...ojLh"
          contract="sm6LqSRQLkM29bMqct9QBRX5HZMEXYgELgwCXpump"
          onHistoryClick={() => alert("History clicked")}
        />
      </section>

      <section className="px-4 sm:px-6 lg:px-10 mt-6">
        <div className="text-right text-xs text-[#6c5a99] mb-2">
          {allItems.length} Items
        </div>

        <NftGrid items={items} />

        {visible < allItems.length && (
          <div className="flex justify-center py-8">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-[#7A4BD6] font-semibold shadow-md hover:shadow-lg transition"
              onClick={() =>
                setVisible((v) => Math.min(v + 20, allItems.length))
              }
            >
              See more
            </motion.button>
          </div>
        )}
      </section>
    </main>
  );
};

export default MyCollectionPage;
