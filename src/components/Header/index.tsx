"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import {
  MdHome,
  MdShoppingBag,
  MdDescription,
  MdGridView,
  MdClose,
  MdMenu,
} from "react-icons/md";

const menu = [
  { label: "Home", href: "/", icon: <MdHome size={22} /> },
  { label: "Mint", href: "/mint", icon: <MdShoppingBag size={22} /> },
  { label: "Doc", href: "/doc", icon: <MdDescription size={22} /> },
  { label: "Collection", href: "/collection", icon: <MdGridView size={22} /> },
];

export default function BelpHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[89] bg-black"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 left-0 h-full w-full max-w-[400px] bg-[#f6effb] z-[99] shadow-2xl border-r border-[#d3b0f7] flex flex-col"
              style={{ minHeight: "100dvh" }}
            >
              <button
                className="absolute top-4 right-4 text-[#9933dd] rounded-full hover:bg-[#e0caff] p-2 transition"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <MdClose size={28} />
              </button>
              <div className="flex flex-col items-center px-5 pt-6 pb-3 border-b border-[#c69dff]">
                <Image
                  src="/belp-logo.svg"
                  alt="belp logo"
                  width={120}
                  height={36}
                  priority
                  className="mb-3"
                />
              </div>
              <div className="flex flex-col items-center mt-4 mb-5">
                <Image
                  src="/avatars/cat-1.png"
                  alt="User"
                  width={56}
                  height={56}
                  className="rounded-full border border-[#d3b0f7] shadow-sm"
                />
                <span className="mt-2 font-semibold text-[#401B79]">
                  User 01
                </span>
              </div>
              <nav className="flex-1 w-full">
                <ul className="flex flex-col gap-2 px-6">
                  {menu.map((item) => (
                    <motion.li
                      key={item.label}
                      initial={{ x: -24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -32, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        delay: 0.05,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 py-2 px-2 rounded-lg font-medium text-[#401B79] hover:bg-[#e8d8fb] transition-all"
                      >
                        <span className="opacity-80">{item.icon}</span>
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header
        className={clsx(
          "w-full",
          "flex items-center justify-between w-full bg-transparent z-50 relative",
          "py-2 md:py-8 px-4 md:px-14"
        )}
      >
        <button
          className="block md:hidden mr-2 rounded-xl p-2 bg-[#f6effb] border border-[#d3b0f7] shadow-sm transition active:scale-95"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <MdMenu size={28} color="#5B357D" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 h-[40px] min-w-[120px] md:ml-1"
        >
          <Image
            src="/belp-logo.svg"
            alt="belp logo"
            width={151}
            height={51}
            priority
          />
        </Link>
        <nav className="flex items-center justify-end h-full">
          <ul className="hidden md:flex gap-2 md:gap-6 items-center">
            {menu.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={clsx(
                    "uppercase text-[15px] tracking-wide px-2 py-1 font-semibold transition-all duration-200",
                    "text-[#ff74fe] hover:text-[#d301d6] hover:underline underline-offset-4"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
