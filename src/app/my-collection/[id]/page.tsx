"use client";

import BreadCrumbs from "@/components/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { makeMockItems } from "@/lib/collection-mock";
import { BiStar } from "react-icons/bi";

const NftDetailPage = () => {
  const { id } = useParams();
  const allItems = useMemo(() => makeMockItems(88), []);
  const item = allItems.find((it) => it.id === id);

  if (!item)
    return <div className="p-8 text-center text-red-500">NFT not found</div>;

  const traits = [
    { label: "SPECIAL", value: "Water" },
    { label: "AURA", value: "Planet" },
    { label: "GLASSES", value: "Sunglasses" },
    { label: "HELMET", value: "Summer" },
    { label: "SNACK", value: "Fish" },
    { label: "FACE", value: "Scar" },
    { label: "EARS", value: "Gold" },
    { label: "HAIR", value: "Devil Horn" },
    { label: "HAT", value: "Hellboy" },
    { label: "MASK", value: "Jason 2" },
    { label: "MOUTH", value: "Water" },
    { label: "NECK", value: "Water" },
    { label: "EQUIP", value: "Water" },
    { label: "CLOAK", value: "Water" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#ede9f6] py-8 px-2">
      <div className="w-full max-w-[900px]">
        <BreadCrumbs
          breadcrumbs={[
            { href: "/my-collection", label: "My Collection" },
            { label: "NFT details" },
          ]}
        />
        <h1 className="mt-6 mb-4 text-[2rem] font-extrabold text-[#6c3ad6] tracking-tight">
          {item.name}
        </h1>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left: Image + Info */}
          <div className="flex flex-col gap-4 w-full md:w-[340px]">
            <div className="rounded-2xl border-2 border-[#7a4bd6] bg-black/80 p-2 w-full h-[320px] flex items-center justify-center shadow-lg">
              <Image
                src={item.image}
                alt={item.name}
                width={260}
                height={260}
                className="rounded-xl object-contain"
              />
            </div>
            {/* Backstory */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#7a4bd6"
                  strokeWidth="2"
                />
                <path d="M12 8v4l3 1" stroke="#7a4bd6" strokeWidth="2" />
              </svg>
              <div>
                <div className="font-bold text-[#2b1a5e] mb-1">Backstory</div>
                <div className="text-[#7466a1] text-sm leading-relaxed">
                  BELPY #{item.id.replace("belpy-", "")} was born under the Moon
                  of Whisker Hollow. Known for its mysterious glow and trickster
                  nature, this BELPY has a hidden destiny linked to the lost
                  Harmony Stone.
                </div>
              </div>
            </div>
            {/* Blockchain details */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="#7a4bd6"
                  strokeWidth="2"
                />
                <path d="M8 8h8v8H8z" stroke="#7a4bd6" strokeWidth="2" />
              </svg>
              <div>
                <div className="font-bold text-[#2b1a5e] mb-1">
                  Blockchain details
                </div>
                <div className="text-[#7466a1] text-sm grid grid-cols-2 gap-x-4">
                  <span>Contract Address</span>
                  <span>#6782</span>
                  <span>Token ID</span>
                  <span>{item.id}</span>
                  <span>Token Standard</span>
                  <span>NFT</span>
                  <span>Chain</span>
                  <span>Solana</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Trait Info */}
          <div className="flex-1 flex flex-col gap-4">
            <button className="self-start px-6 py-2 rounded-xl bg-[#7a4bd6] text-white font-bold shadow text-base mb-2">
              GENESIS BELPY !
            </button>
            <div className="bg-[#E3CEF6] rounded-xl p-4">
              <div className="font-bold text-[#2b1a5e] mb-2 flex items-center gap-2 text-base">
                <BiStar />
                Trait
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {traits.map((trait) => (
                  <div
                    key={trait.label}
                    className="bg-white rounded-lg px-3 py-2 text-sm flex flex-col items-start border border-[#e9defd]"
                  >
                    <span className="text-[#6c5a99] font-semibold mb-1">
                      {trait.label}
                    </span>
                    <span className="font-bold text-[#7a4bd6] text-base">
                      {trait.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftDetailPage;
