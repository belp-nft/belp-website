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
  MdSmartButton,
} from "react-icons/md";
import { usePathname } from "next/navigation";
import ConnectWallet from "../Wallet/ConnectWallet";

const menu = [
  { label: "HOME", href: "/", icon: <MdHome size={22} /> },
  { label: "MINT", href: "/mint", icon: <MdSmartButton size={22} /> },
  { label: "LORE", href: "/lore", icon: <MdShoppingBag size={22} /> },
  { label: "DOC", href: "/doc", icon: <MdDescription size={22} /> },
  // {
  //   label: "MY COLLECTION",
  //   href: "/my-collection",
  //   icon: <MdGridView size={22} />,
  // },
];

export default function BelpHeader() {
  const pathname = usePathname();

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
              <div className="flex flex-col items-center px-5 pt-6 pb-3 border-b border-[#c69dff] relative">
                <Image
                  src="/belp-logo.svg"
                  alt="belp logo"
                  width={120}
                  height={36}
                  priority
                  className="mb-3"
                />
                <button
                  className="absolute top-4 right-4 text-[#9933dd] rounded-full hover:bg-[#e0caff] p-2 transition"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <MdClose size={28} />
                </button>
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
                        className={clsx(
                          "flex items-center gap-3 py-2 px-2 rounded-lg font-semibold uppercase tracking-wider text-[18px]",
                          pathname.startsWith(item.href)
                            ? "text-[#AE9CFF] font-extrabold"
                            : "text-[#6B6475] hover:bg-[#e8d8fb] transition-all"
                        )}
                      >
                        <span className="opacity-80">{item.icon}</span>
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <div className="flex items-center justify-center mt-6">
                  <ConnectWallet
                    onConnected={(info) => console.log("Connected:", info)}
                  />
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header
        className={clsx(
          "w-full z-50 absolute top-0 left-0 py-2 md:py-3 px-4 sm:px-6 lg:px-10",
          "flex items-center justify-between",
          "bg-gradient-to-b from-[#FFE7FF80] to-[#FEF5FE]",
          pathname === "/" && "top-10"
        )}
        style={{ left: 0, right: 0 }}
      >
        <div className="flex flex-1 md:hidden items-center justify-between relative h-[52px]">
          <button
            className="block md:hidden rounded-xl p-2 bg-[#f6effb] border border-[#d3b0f7] shadow-sm transition active:scale-95"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <MdMenu size={28} color="#5B357D" />
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center gap-2" tabIndex={-1}>
              <Image
                src="/belp-logo.svg"
                alt="belp logo"
                width={120}
                height={36}
                priority
              />
            </Link>
          </div>
          <div className="w-[44px] h-[44px]" />
        </div>

        <Link
          href="/"
          className="hidden md:flex items-center gap-2 h-[40px] min-w-[120px] md:ml-1"
        >
          <Image
            src="/belp-logo.svg"
            alt="belp logo"
            width={151}
            height={51}
            priority
          />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex gap-12 items-center">
            {menu.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "uppercase text-[16px] lg:text-[20px] xl:text-[24px] font-bold tracking-[.08em] transition-all duration-150 px-1",
                      clsx(
                        "hover:text-[#5B357D]",
                        isActive &&
                          "underline underline-offset-[9px] decoration-2 decoration-[#1C007C]"
                      )
                    )}
                    style={{ letterSpacing: 2 }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <ConnectWallet
            onConnected={(info) => console.log("Connected:", info)}
          />
        </div>
      </header>
    </>
  );
}
